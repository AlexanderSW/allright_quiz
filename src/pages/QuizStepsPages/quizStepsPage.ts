import { Page } from '@playwright/test';
import { QuizAnswersDto } from '../../data/dto/quizAnswersDto';
import { SignUpFormPage } from '../SignUpPages/signUpFormPage';
import { QuizConfirmationPage } from '../ConfirmationPages/quizConfirmationPage';

const MAX_STEPS = 25;
// Any of these roles/text patterns are treated as "the way forward" for a
// step, regardless of which A/B variant renders it. This is the deterministic
// core: keep advancing by generic affordance, not by memorized step order.
const NEXT_ACTION_PATTERN = /^(next|continue|далі|продовжити|get started|start|yes|no)$/i;

// Resilient, step-agnostic navigation through the quiz. Deliberately has no
// per-step selectors — the quiz's steps/order/copy change with A/B tests, so
// hardcoded selectors would break constantly. An unrecognized step is the
// boundary where an AI-driven agent (see README) would take over instead.
export class QuizStepsPage {
    private readonly signUpForm: SignUpFormPage;
    private readonly confirmation: QuizConfirmationPage;

    constructor(private readonly page: Page) {
        this.signUpForm = new SignUpFormPage(page);
        this.confirmation = new QuizConfirmationPage(page);
    }

    async advance(answers: QuizAnswersDto): Promise<void> {
        for (let step = 0; step < MAX_STEPS; step++) {
            if (this.confirmation.isDisplayed()) {
                return;
            }

            if (await this.fillEmailIfPresent(answers.email)) {
                continue;
            }

            if (await this.pickAgeIfPresent(answers.age)) {
                continue;
            }

            const advanced = await this.clickNextAffordance();
            if (!advanced) {
                // No recognizable control found — stop instead of guessing blindly.
                return;
            }
        }
    }

    private async fillEmailIfPresent(email: string): Promise<boolean> {
        if (await this.signUpForm.submitEmailIfPresent(email)) {
            await this.clickNextAffordance();
            return true;
        }
        return false;
    }

    private async pickAgeIfPresent(age?: number): Promise<boolean> {
        if (!age) return false;
        const ageOption = this.page.getByRole('button', { name: String(age) }).or(this.page.getByText(String(age), { exact: true }));
        if (await ageOption.first().isVisible().catch(() => false)) {
            await ageOption.first().click();
            return true;
        }
        return false;
    }

    private async clickNextAffordance(): Promise<boolean> {
        const byRole = this.page.getByRole('button', { name: NEXT_ACTION_PATTERN });
        if (await byRole.first().isVisible().catch(() => false)) {
            await byRole.first().click();
            return true;
        }

        const anyEnabledButton = this.page.locator('button:not([disabled])');
        if (await anyEnabledButton.first().isVisible().catch(() => false)) {
            await anyEnabledButton.first().click();
            return true;
        }

        return false;
    }
}
