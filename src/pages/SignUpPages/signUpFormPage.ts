import { Page } from '@playwright/test';

// Represents the sign-up email-capture step specifically, for tests that
// need to interact with it directly (UI + API layer) rather than power
// through the whole quiz.
export class SignUpFormPage {
    constructor(private readonly page: Page) { }

    private get emailInput() {
        return this.page.getByLabel(/email/i).or(this.page.locator('input[type="email"]'));
    }

    async isDisplayed(): Promise<boolean> {
        return this.emailInput.first().isVisible().catch(() => false);
    }

    async submitEmailIfPresent(email: string): Promise<boolean> {
        if (!(await this.isDisplayed())) {
            return false;
        }
        await this.emailInput.first().fill(email);
        return true;
    }
}
