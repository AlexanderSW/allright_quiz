import { test, expect } from '../../src/fixtures/quizFixtures';
import { buildQuizAnswers } from '../../src/data/factories/quizAnswersFactory';

// UI + API layer: drives one concrete quiz step through the UI, then
// verifies the resulting state through the API instead of trusting a
// transient UI confirmation, which differs across A/B variants.
test.describe('Quiz sign-up step', () => {
    test('submitting the email step does not create an account by itself', async ({ quizPage, quizApiClient }) => {
        const { email } = buildQuizAnswers();

        await quizPage.open();
        await quizPage.signUpForm.submitEmailIfPresent(email);

        const user = await quizApiClient.user.findByEmail(email);
        expect(user.exists).toBe(false);
    });
});
