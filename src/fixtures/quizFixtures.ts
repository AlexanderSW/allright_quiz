import { test as apiTest } from './apiFixtures';
import { QuizPage } from '../pages/QuizPage';

interface QuizFixtures {
    quizPage: QuizPage;
}

// Combines the API fixture layer with the quiz page object so the UI+API and
// E2E specs share the same setup instead of duplicating it.
export const test = apiTest.extend<QuizFixtures>({
    quizPage: async ({ page }, use) => {
        await use(new QuizPage(page));
    },
});

export { expect } from '@playwright/test';
