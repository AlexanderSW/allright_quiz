import { test as base } from '@playwright/test';
import { QuizApi } from '../api/quizApi';

interface ApiFixtures {
    quizApiClient: QuizApi;
}

// API-only fixture layer, usable by contract tests that don't need a browser page.
export const test = base.extend<ApiFixtures>({
    quizApiClient: async ({ request }, use) => {
        await use(new QuizApi(request));
    },
});

export { expect } from '@playwright/test';
