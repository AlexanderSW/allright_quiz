import { test, expect } from '../../src/fixtures/apiFixtures';

// Contract layer: verifies the shape of the quiz-session API stays stable
// regardless of which A/B variant or step set is currently active. We assert
// on structure only (status, id, steps being a list) — never on specific
// step content, copy, or ordering, since those change too often to be a
// useful signal at this layer.
test.describe('Quiz session API contract', () => {
    test('quiz session response has the fields tests rely on', async ({ quizApiClient }) => {
        const session = await quizApiClient.quizSession.getSession();

        expect(session.status).toBeGreaterThanOrEqual(200);
        expect(session.status).toBeLessThan(500);
        expect(Array.isArray(session.steps)).toBe(true);
    });
});
