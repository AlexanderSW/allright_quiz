import { Page } from '@playwright/test';
import { quizStartUrl } from '../config/env';
import { QuizAnswersDto } from '../data/dto/quizAnswersDto';
import { SignUpFormPage } from './SignUpPages/signUpFormPage';
import { QuizStepsPage } from './QuizStepsPages/quizStepsPage';
import { QuizStepAnswerPage } from './QuizStepsPages/quizStepAnswerPage';
import { QuizConfirmationPage } from './ConfirmationPages/quizConfirmationPage';

const QUIZ_EXPERIMENT_ALIAS = 'QUIZ_CHARLIE_VS_PERSONALIZED';

export type QuizVariant = 'A' | 'B';

export interface AuthenticatedQuizSession {
    accessToken: string;
    userId: string;
}

// Thin top-level page object around the quiz. Deliberately has no per-step
// locators of its own — it delegates resilient navigation and confirmation
// detection to dedicated page objects that survive A/B and step changes.
export class QuizPage {
    readonly signUpForm: SignUpFormPage;
    readonly steps: QuizStepsPage;
    readonly stepAnswer: QuizStepAnswerPage;
    readonly confirmation: QuizConfirmationPage;

    constructor(private readonly page: Page) {
        this.signUpForm = new SignUpFormPage(page);
        this.steps = new QuizStepsPage(page);
        this.stepAnswer = new QuizStepAnswerPage(page);
        this.confirmation = new QuizConfirmationPage(page);
    }

    async open(): Promise<void> {
        await this.page.goto(quizStartUrl());
    }

    // Pin the A/B experiment before the entry route loads so both quiz
    // variants can be covered deterministically in separate browser contexts.
    async useVariant(variant: QuizVariant): Promise<void> {
        const url = new URL(quizStartUrl());
        await this.page.context().addCookies([{
            name: 'experiments',
            value: JSON.stringify([{ alias: QUIZ_EXPERIMENT_ALIAS, variant }]),
            domain: url.hostname,
            path: '/',
        }]);
    }

    async getAuthenticatedSession(): Promise<AuthenticatedQuizSession> {
        const session = await this.page.evaluate(() => {
            const raw = localStorage.getItem('ember_simple_auth-session');
            if (!raw) return null;

            const parsed = JSON.parse(raw) as {
                authenticated?: {
                    access_token?: unknown;
                    user_id?: unknown;
                };
            };
            const accessToken = parsed.authenticated?.access_token;
            const userId = parsed.authenticated?.user_id;

            return typeof accessToken === 'string'
                && (typeof userId === 'string' || typeof userId === 'number')
                ? { accessToken, userId: String(userId) }
                : null;
        });

        if (!session) {
            throw new Error('Quiz completion did not create an authenticated user session');
        }
        return session;
    }

    async completeQuiz(answers: QuizAnswersDto): Promise<void> {
        await this.steps.advance(answers);
    }

    isOnConfirmationScreen(): boolean {
        return this.confirmation.isDisplayed();
    }
}
