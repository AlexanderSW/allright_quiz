import { APIRequestContext } from '@playwright/test';
import { QuizSessionMethods } from '../../apiMethods/QuizSession/quizSessionMethods';
import { QuizSessionDto } from '../../../data/dto/quizSessionDto';

// Validates only the parts of the quiz-session contract that must hold for
// every A/B variant (status, presence of an id, steps being a list) —
// never specific step content, copy, or ordering.
export class QuizSessionController {
    private readonly methods: QuizSessionMethods;

    constructor(request: APIRequestContext) {
        this.methods = new QuizSessionMethods(request);
    }

    async getSession(sessionId?: string): Promise<QuizSessionDto> {
        const response = await this.methods.getQuizSession(sessionId);
        const body = response.ok() ? await response.json() : null;

        return {
            status: response.status(),
            sessionId: body?.id,
            variant: body?.variant,
            steps: Array.isArray(body?.steps) ? body.steps : [],
        };
    }
}
