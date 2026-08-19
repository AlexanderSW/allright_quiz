import { Page, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Some steps (e.g. multi-select chip questions) don't advance on the first
// answer click — they need an explicit "Continue" click afterwards. The
// label varies by locale/variant, so it's matched generically rather than
// hardcoded to one language.
const CONTINUE_BUTTON_PATTERN = /^\s*(продовжити|continue|далі|next)\s*$/i;

// Generic per-step page object. Every quiz step renders inside a container
// tagged with data-step-name="<step>" regardless of which A/B variant is
// active, so this is the one stable selector across the whole quiz. Answer
// options are addressed generically (first button in the container) since
// their count, copy and order change per step and per variant.
export class QuizStepAnswerPage {
    constructor(private readonly page: Page) { }

    private get stepContainer(): Locator {
        return this.page.locator('[data-step-name]').first();
    }

    // Excludes submit buttons, which belong to text-input steps (e.g.
    // name/email) that are out of scope for button-only coverage.
    private get allNonSubmitButtons(): Locator {
        return this.stepContainer.locator('button:not([type="submit"])');
    }

    // Same as above but also excludes the Continue button, so it's never
    // mistaken for an answer choice on multi-select steps that have one.
    private get answerOptionButtons(): Locator {
        return this.allNonSubmitButtons.filter({ hasNotText: CONTINUE_BUTTON_PATTERN });
    }

    private get continueButton(): Locator {
        return this.stepContainer.getByRole('button', { name: CONTINUE_BUTTON_PATTERN });
    }

    private get bookLessonButton(): Locator {
        return this.page.getByRole('button', { name: /забронювати урок|book lesson/i });
    }

    // The "N / M" progress counter (e.g. "2 / 13") has no stable testid, only
    // a build-hashed class, so it's located by its text shape instead. The
    // total (M) is the source of truth for how many steps the current A/B
    // variant has — it must never be hardcoded since it changes per variant.
    private get stepCounter(): Locator {
        return this.page.getByText(/^\s*\d+\s*\/\s*\d+\s*$/).last();
    }

    // Text-input steps (name/phone/email) have no answer buttons, only an
    // input and a submit button. Scoped by the exact data-step-name value
    // (not stepContainer's generic .first()), since a stale step can
    // otherwise be matched while the previous one is still unmounting.
    private stepContainerFor(stepName: string): Locator {
        return this.page.locator(`[data-step-name="${stepName}"]`);
    }

    private textInputFor(stepName: string): Locator {
        return this.stepContainerFor(stepName).locator('input:not([type="hidden"])').first();
    }

    private get parentNameInput(): Locator {
        return this.page.locator('[id="user-info-name"] input');
    }

    private get phoneInput(): Locator {
        return this.page.locator('input[type="tel"]');
    }

    private get phoneCountrySelector(): Locator {
        return this.page.locator('button.iti__selected-country');
    }

    private async clickAndFillPhone(phone: string): Promise<void> {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                await this.phoneInput.click({ timeout: 5_000 });
                await this.phoneInput.fill(phone, { timeout: 5_000 });
                return;
            } catch (error) {
                if (attempt === 2) {
                    throw error;
                }
            }
        }
    }

    private submitButtonFor(stepName: string): Locator {
        return this.stepContainerFor(stepName).locator('button[type="submit"]');
    }

    private get leavingPagePopupCloseButton(): Locator {
        return this.page.locator('.popup-leaving-page button');
    }

    // Both choices have an empty data-mode value, so select the second
    // adjacent button ("Я — мати або батько") structurally.
    private get whoFillsFormParentOption(): Locator {
        return this.page.locator('.ui-modal--dialog-center button[data-mode] + button[data-mode]');
    }

    private async dismissBlockingPopups(): Promise<void> {
        if (await this.leavingPagePopupCloseButton.isVisible().catch(() => false)) {
            await this.leavingPagePopupCloseButton.click();
        }
        if (await this.whoFillsFormParentOption.isVisible().catch(() => false)) {
            await this.whoFillsFormParentOption.click();
        }
    }

    async waitForStep(): Promise<void> {
        await this.dismissBlockingPopups();
        await this.stepContainer.waitFor({ state: 'visible' });
        await this.dismissBlockingPopups();
    }

    // The final step's submit navigates away from the quiz entirely (real
    // account creation), so callers must check this before waiting on a step
    // container that will never appear again.
    isInQuizFlow(): boolean {
        return this.page.url().includes('/sign-up/');
    }

    async getStepName(): Promise<string | null> {
        await this.waitForStep();
        return this.stepContainer.getAttribute('data-step-name');
    }

    async waitForStepName(stepName: string): Promise<void> {
        await this.page.locator(`[data-step-name="${stepName}"]`).first().waitFor({ state: 'visible' });
        await this.dismissBlockingPopups();
    }

    async getTotalStepsCount(): Promise<number> {
        const text = await this.stepCounter.textContent();
        const match = text?.match(/(\d+)\s*\/\s*(\d+)/);
        if (!match) {
            throw new Error(`Could not parse step counter text: "${text}"`);
        }
        return Number(match[2]);
    }

    async hasAnswerOptions(): Promise<boolean> {
        await this.waitForStep();
        return (await this.allNonSubmitButtons.count()) > 0;
    }

    async isBookingStep(): Promise<boolean> {
        return this.bookLessonButton.isVisible().catch(() => false);
    }

    async hasTextInput(): Promise<boolean> {
        await this.waitForStep();
        if (await this.phoneInput.isVisible().catch(() => false)) {
            return true;
        }
        if (await this.phoneCountrySelector.isVisible().catch(() => false)) {
            await this.phoneInput.waitFor({ state: 'visible' });
            return true;
        }
        if (await this.parentNameInput.isVisible().catch(() => false)) {
            return true;
        }
        if ((await this.allNonSubmitButtons.count()) > 0) {
            return false;
        }
        const stepName = await this.getStepName();
        if (!stepName) {
            return false;
        }
        return (await this.textInputFor(stepName).count()) > 0;
    }

    // Fills the step's input with faker-generated data and submits it. The
    // phone step is handled separately since it needs an explicit selector
    // and a fixed +380 format, not the generic name/email path.
    async answerTextInput(): Promise<void> {
        await this.waitForStep();

        const phoneInput = this.phoneInput;
        const isPhoneStep =
            await phoneInput.isVisible().catch(() => false)
            || await this.phoneCountrySelector.isVisible().catch(() => false);
        if (isPhoneStep) {
            await phoneInput.waitFor({ state: 'visible' });
            const phone = `+38063${faker.string.numeric(7)}`;
            await this.clickAndFillPhone(phone);
            // The phone-mask state is updated only after a native keyboard
            // input event. Add and remove a digit so the submitted value
            // remains the generated +38063xxxxxxx number.
            await phoneInput.press('End');
            await phoneInput.type('0');
            await phoneInput.press('Backspace');
            await this.page.locator('button[type="submit"]:visible').click();
            return;
        }

        // The name input has a stable form id, while its submit button is a
        // sibling rather than a descendant of that id.
        if (await this.parentNameInput.isVisible().catch(() => false)) {
            await this.parentNameInput.fill(faker.person.firstName());
            await this.page.locator('button[type="submit"]:visible').click();

            await this.whoFillsFormParentOption.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
            await this.dismissBlockingPopups();
            return;
        }

        const stepName = (await this.getStepName()) as string;

        const input = this.textInputFor(stepName);
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const value = this.generateFakeValueFor(type, name);

        await input.click();
        await input.fill(value);
        await this.submitButtonFor(stepName).click();

        // The parent-name step shows a blocking "who fills this form"
        // dialog after typing the name; answering it both dismisses the
        // dialog and advances to the next step.
        await this.dismissBlockingPopups();
    }

    private generateFakeValueFor(type: string | null, name: string | null): string {
        if (type === 'email' || name === 'email') {
            return faker.internet.email();
        }
        return faker.person.firstName();
    }

    async answerFirstOption(): Promise<void> {
        await this.waitForStep();

        if (await this.isBookingStep()) {
            await this.bookLessonButton.click();
            return;
        }

        const stepBefore = await this.stepContainer.getAttribute('data-step-name');

        // Info-only steps have no real answer, just a single Continue/Next
        // button acting as the way forward — fall back to it when there's no
        // other option.
        const options = this.answerOptionButtons;
        if ((await options.count()) > 0) {
            await options.first().click();
        } else {
            await this.allNonSubmitButtons.first().click();
        }
        await this.dismissBlockingPopups();

        // Multi-select steps stay on the same step after picking an answer
        // and need an explicit Continue click; single-select steps
        // auto-advance and never show a Continue button here.
        const stayedOnSameStep = (await this.stepContainer.getAttribute('data-step-name').catch(() => null)) === stepBefore;
        if (stayedOnSameStep && (await this.continueButton.isVisible().catch(() => false))) {
            await this.continueButton.click();
        }
    }
}
