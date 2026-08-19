import { Page, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Some steps (e.g. multi-select chip questions) don't advance on the first
// answer click — they need an explicit "Continue" click afterwards. The
// label varies by locale/variant, so it's matched generically rather than
// hardcoded to one language.
const CONTINUE_BUTTON_PATTERN = /^\s*(продовжити|continue|далі|next)\s*$/i;

// The "who is filling this form" interstitial (child vs parent) renders as a
// <dialog>, not inside the step container, and blocks clicks on the step
// underneath until answered. It only appears on the parent-name step, but is
// handled generically by presence rather than being tied to one step name.
const WHO_FILLS_FORM_PARENT_OPTION_PATTERN = /мати або батько|parent/i;

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

    // The "N / M" progress counter (e.g. "2 / 13") has no stable testid, only
    // a build-hashed class, so it's located by its text shape instead. The
    // total (M) is the source of truth for how many steps the current A/B
    // variant has — it must never be hardcoded since it changes per variant.
    private get stepCounter(): Locator {
        return this.page.getByText(/^\s*\d+\s*\/\s*\d+\s*$/).last();
    }

    // Text-input steps (name/phone/email) have no answer buttons, only an
    // input and a submit button.
    private get textInput(): Locator {
        return this.stepContainer.locator('input:not([type="hidden"])').first();
    }

    private get submitButton(): Locator {
        return this.stepContainer.locator('button[type="submit"]');
    }

    private get whoFillsFormParentOption(): Locator {
        return this.page.getByRole('dialog').getByRole('button', { name: WHO_FILLS_FORM_PARENT_OPTION_PATTERN });
    }

    async waitForStep(): Promise<void> {
        await this.stepContainer.waitFor({ state: 'visible' });
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

    async hasTextInput(): Promise<boolean> {
        await this.waitForStep();
        return (await this.textInput.count()) > 0;
    }

    // Fills the step's input with faker-generated data (picked by input
    // type/name, since name/phone/email steps share the same shape) and
    // submits it.
    async answerTextInput(): Promise<void> {
        await this.waitForStep();
        const input = this.textInput;
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const value = this.generateFakeValueFor(type, name);

        // All these fields are backed by JS input masks/validators that only
        // react to real keystrokes — a plain .fill() sets the DOM value
        // without the framework noticing, leaving the submit button disabled
        // or validation still reporting the field as empty.
        await input.click();
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.type(value);

        await this.submitButton.click();

        // The parent-name step shows a blocking "who fills this form"
        // dialog after typing the name; answering it both dismisses the
        // dialog and advances to the next step.
        if (await this.whoFillsFormParentOption.isVisible().catch(() => false)) {
            await this.whoFillsFormParentOption.click();
        }
    }

    private generateFakeValueFor(type: string | null, name: string | null): string {
        if (type === 'tel' || name === 'phone') {
            // 9 digits fits the "+380 XX XXX XXXX" mask shown on the phone step.
            return faker.string.numeric(9);
        }
        if (type === 'email' || name === 'email') {
            return faker.internet.email();
        }
        return faker.person.firstName();
    }

    async answerFirstOption(): Promise<void> {
        await this.waitForStep();
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

        // Multi-select steps stay on the same step after picking an answer
        // and need an explicit Continue click; single-select steps
        // auto-advance and never show a Continue button here.
        const stayedOnSameStep = (await this.stepContainer.getAttribute('data-step-name').catch(() => null)) === stepBefore;
        if (stayedOnSameStep && (await this.continueButton.isVisible().catch(() => false))) {
            await this.continueButton.click();
        }
    }
}
