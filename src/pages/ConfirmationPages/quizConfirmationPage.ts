import { Page } from '@playwright/test';

// Dedicated surface for the post-quiz confirmation screen. Only checks for a
// generic success signal (URL pattern) since the confirmation copy/layout
// itself varies across A/B variants.
export class QuizConfirmationPage {
    constructor(private readonly page: Page) { }

    isDisplayed(): boolean {
        return /sign-up.*(done|success|complete|confirmation)/i.test(this.page.url());
    }
}
