import { APIRequestContext } from '@playwright/test';
import { UserController } from './apiController/User/userController';
import { TrialLessonController } from './apiController/TrialLesson/trialLessonController';
import { QuizExperimentController } from './apiController/QuizExperiment/quizExperimentController';

// Single entry point tests use to verify quiz business outcomes (user +
// trial lesson) and inspect the quiz experiment contract, without depending on
// which A/B variant or UI steps produced them.
export class QuizApi {
    readonly user: UserController;
    readonly trialLesson: TrialLessonController;
    readonly quizExperiment: QuizExperimentController;

    constructor(request: APIRequestContext) {
        this.user = new UserController(request);
        this.trialLesson = new TrialLessonController(request);
        this.quizExperiment = new QuizExperimentController(request);
    }
}
