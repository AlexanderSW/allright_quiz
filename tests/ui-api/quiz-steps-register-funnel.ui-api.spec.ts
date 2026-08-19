import { test, expect } from '../../src/fixtures/quizFixtures';

// UI + API layer: clicks/fills through every quiz step using the one
// selector that is stable across every A/B variant — the data-step-name
// container — up to the total step count read live from the quiz's own
// progress counter (never hardcoded, since it changes per A/B variant).
// Button-only steps are answered by clicking; text-input steps (name/phone)
// are filled with faker-generated data. This runs the flow through to the
// real final submission (the phone step), which creates a real account, same
// accepted side effect as the e2e layer (see tests/e2e/quiz-completion.e2e.spec.ts).
// After every step it verifies the FRONTEND_REGISTER_FUNNEL beacon the
// frontend actually sent — both its payload against the RegisterFunnelEventDto
// contract and its response — instead of trusting the UI transition alone.
test.describe('Quiz steps register-funnel tracking', () => {
    test('answering each step emits a valid register-funnel event and response', async ({
        quizPage,
        registerFunnelListener,
    }) => {
        test.setTimeout(90_000);
        await quizPage.open();

        const totalSteps = await quizPage.stepAnswer.getTotalStepsCount();
        console.log(`Total steps in this A/B variant: ${totalSteps}`);
        expect(totalSteps).toBeGreaterThan(0);

        for (let step = 1; step <= totalSteps; step++) {
            if (!quizPage.stepAnswer.isInQuizFlow()) {
                break;
            }

            console.log(`Answering step ${step} of ${totalSteps}...`);

            const hasAnswerOptions = await quizPage.stepAnswer.hasAnswerOptions();
            const hasTextInput = hasAnswerOptions ? false : await quizPage.stepAnswer.hasTextInput();
            if (!hasAnswerOptions && !hasTextInput) {
                break;
            }

            const currentStepName = await quizPage.stepAnswer.getStepName();
            expect(currentStepName).not.toBeNull();

            const capture = await registerFunnelListener.captureDuring(currentStepName as string, () =>
                hasAnswerOptions ? quizPage.stepAnswer.answerFirstOption() : quizPage.stepAnswer.answerTextInput(),
            );

            // The final step (phone submission) navigates away from the quiz
            // entirely once accepted, so the next step name is read from the
            // event itself rather than re-querying the DOM, which would hang
            // waiting for a step container that no longer exists.
            const nextStepName = capture.event.properties.transition.to;

            expect(capture.event.event).toBe('FRONTEND_REGISTER_FUNNEL');
            expect(capture.event.properties.eventName).toBe(nextStepName);

            expect(capture.responseStatus).toBe(200);
            expect(capture.responseBody).toEqual({ ok: true });
        }
    });
});
