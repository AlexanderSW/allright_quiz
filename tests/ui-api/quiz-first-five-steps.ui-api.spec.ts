import { test, expect } from '../../src/fixtures/quizFixtures';

// UI + API layer: clicks through every button-only quiz step using the one
// selector that is stable across every A/B variant — the data-step-name
// container — up to the total step count read live from the quiz's own
// progress counter (never hardcoded, since it changes per A/B variant). It
// stops at the first step that has no answer buttons (e.g. a text-input
// step) instead of completing the quiz, to avoid creating a real account and
// trial-lesson booking as a side effect (see the e2e layer for that outcome).
// After every click it verifies the FRONTEND_REGISTER_FUNNEL beacon the
// frontend actually sent — both its payload against the RegisterFunnelEventDto
// contract and its response — instead of trusting the UI transition alone.
test.describe('Quiz steps register-funnel tracking', () => {
    test('answering each button-only step emits a valid register-funnel event and response', async ({
        quizPage,
        registerFunnelListener,
    }) => {
        await quizPage.open();

        const totalSteps = await quizPage.stepAnswer.getTotalStepsCount();
        expect(totalSteps).toBeGreaterThan(0);

        for (let step = 1; step <= totalSteps; step++) {
            if (!(await quizPage.stepAnswer.hasAnswerOptions())) {
                break;
            }

            const capture = await registerFunnelListener.captureDuring(() => quizPage.stepAnswer.answerFirstOption());
            const nextStepName = await quizPage.stepAnswer.getStepName();

            expect(capture.event.event).toBe('FRONTEND_REGISTER_FUNNEL');
            expect(capture.event.properties.eventName).toBe(nextStepName);
            expect(capture.event.properties.transition.to).toBe(nextStepName);

            expect(capture.responseStatus).toBe(200);
            expect(capture.responseBody).toEqual({ ok: true });
        }
    });
});
