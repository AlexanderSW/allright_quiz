import { test, expect } from '../../src/fixtures/quizFixtures';
import { buildQuizAnswers } from '../../src/data/factories/quizAnswersFactory';

// E2E layer: the one thing that truly matters end-to-end — completing the
// quiz (any A/B variant, any step order) produces the two business outcomes
// the whole funnel exists for: a created user and a booked trial lesson.
// Note: this creates a real account and trial-lesson booking on the stage
// environment (see README for cleanup assumptions).
test.describe('Quiz completion business outcome', () => {
    test('completing the quiz creates a user and books a trial lesson', async ({ quizPage, quizApiClient }) => {
        const answers = buildQuizAnswers();

        await quizPage.open();
        await quizPage.completeQuiz(answers);

        await expect(async () => {
            const user = await quizApiClient.user.findByEmail(answers.email);
            expect(user.exists).toBe(true);
            expect(user.userId).toBeTruthy();

            const trialLesson = await quizApiClient.trialLesson.findByUserId(user.userId!);
            expect(trialLesson.booked).toBe(true);
        }).toPass({ timeout: 15_000 });
    });
});
