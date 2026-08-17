import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';

// Raw HTTP call only — no business interpretation of the response.
// TODO: replace placeholder endpoint with the real quiz-session/config API once confirmed with backend.
export class QuizSessionMethods {
    constructor(private readonly request: APIRequestContext) { }

    async getQuizSession(sessionId?: string) {
        return this.request.get(`${env.apiBaseUrl}/quiz-sessions${sessionId ? `/${sessionId}` : ''}`);
    }
}
