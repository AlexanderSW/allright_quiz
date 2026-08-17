import { Page } from '@playwright/test';
import { quizStartUrl } from '../config/env';
import { QuizAnswersDto } from '../data/dto/quizAnswersDto';
import { SignUpFormPage } from './SignUpPages/signUpFormPage';
import { QuizStepsPage } from './QuizStepsPages/quizStepsPage';
import { QuizConfirmationPage } from './ConfirmationPages/quizConfirmationPage';

// Thin top-level page object around the quiz. Deliberately has no per-step
// locators of its own — it delegates resilient navigation and confirmation
// detection to dedicated page objects that survive A/B and step changes.
export class QuizPage {
    readonly signUpForm: SignUpFormPage;
    readonly steps: QuizStepsPage;
    readonly confirmation: QuizConfirmationPage;

    constructor(private readonly page: Page) {
        this.signUpForm = new SignUpFormPage(page);
        this.steps = new QuizStepsPage(page);
        this.confirmation = new QuizConfirmationPage(page);
    }

    async open(): Promise<void> {
        await this.page.goto(quizStartUrl());
    }

    async completeQuiz(answers: QuizAnswersDto): Promise<void> {
        await this.steps.advance(answers);
    }

    isOnConfirmationScreen(): boolean {
        return this.confirmation.isDisplayed();
    }
}
