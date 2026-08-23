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
        test.setTimeout(180_000);
        await quizPage.open();

        const totalSteps = await quizPage.stepAnswer.getTotalStepsCount();
        console.log(`Total steps in this A/B variant: ${totalSteps}`);
        expect(totalSteps).toBeGreaterThan(0);

        // The progress counter counts question fragments, while some A/B
        // variants insert info-only screens between them. Allow enough
        // transitions for those screens and stop only when the quiz flow is
        // actually left.
        const maxTransitions = totalSteps * 3;
        for (let transition = 1; transition <= maxTransitions; transition++) {
            if (!quizPage.stepAnswer.isInQuizFlow()) {
                break;
            }

            console.log(`Answering transition ${transition} (quiz has ${totalSteps} fragments)...`);

            // Text steps can also contain auxiliary buttons (e.g. "friend
            // code" on the parent-name form), so inputs take precedence over
            // button-only answer options.
            const hasTextInput = await quizPage.stepAnswer.hasTextInput();
            const hasAnswerOptions = hasTextInput ? false : await quizPage.stepAnswer.hasAnswerOptions();
            if (!hasAnswerOptions && !hasTextInput) {
                break;
            }

            const currentStepName = await quizPage.stepAnswer.getStepName();
            expect(currentStepName).not.toBeNull();
            const isBookingStep = await quizPage.stepAnswer.isBookingStep();
            const answerCurrentStep = () => hasAnswerOptions
                ? quizPage.stepAnswer.answerFirstOption()
                : quizPage.stepAnswer.answerTextInput();

            // Booking creates the lesson and leaves the funnel. It does not
            // emit another step-to-step REGISTER_FUNNEL transition.
            if (isBookingStep) {
                await answerCurrentStep();
                await expect.poll(() => quizPage.stepAnswer.isInQuizFlow(), {
                    timeout: 20_000,
                }).toBe(false);
                break;
            }

            const capture = await registerFunnelListener.captureDuring(
                currentStepName as string,
                answerCurrentStep,
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

            if (quizPage.stepAnswer.isInQuizFlow()) {
                await quizPage.stepAnswer.waitForStepName(nextStepName);
            }
        }

        expect(quizPage.stepAnswer.isInQuizFlow()).toBe(false);
    });
});
