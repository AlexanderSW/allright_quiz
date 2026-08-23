import { test, expect } from '../../src/fixtures/apiFixtures';

const QUIZ_EXPERIMENT_ALIAS = 'QUIZ_CHARLIE_VS_PERSONALIZED';

test.describe('Quiz experiment API contract', () => {
    test('returns a usable current quiz variant for the Ukrainian market', async ({ quizApiClient }) => {
        const response = await quizApiClient.quizExperiment.getExperiment({
            alias: QUIZ_EXPERIMENT_ALIAS,
            market: 'uk',
        });

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();

        const experiment = response.body!.data.attributes;
        expect(experiment.alias).toBe(QUIZ_EXPERIMENT_ALIAS);
        expect(experiment['is-deleted']).toBe(false);
        expect(Object.keys(experiment.variants)).toContain(experiment['current-variant']);
        expect(experiment.variants[experiment['current-variant']]).toEqual(expect.any(Number));
    });
});
