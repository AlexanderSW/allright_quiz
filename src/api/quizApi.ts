import { APIRequestContext } from '@playwright/test';
import { UserController } from './apiController/User/userController';
import { TrialLessonController } from './apiController/TrialLesson/trialLessonController';
import { QuizSessionController } from './apiController/QuizSession/quizSessionController';

// Single entry point tests use to verify quiz business outcomes (user +
// trial lesson) and inspect the quiz-session contract, without depending on
// which A/B variant or UI steps produced them.
export class QuizApi {
    readonly user: UserController;
    readonly trialLesson: TrialLessonController;
    readonly quizSession: QuizSessionController;

    constructor(request: APIRequestContext) {
        this.user = new UserController(request);
        this.trialLesson = new TrialLessonController(request);
        this.quizSession = new QuizSessionController(request);
    }
}
