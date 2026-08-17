import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';

// Raw HTTP call only — no business interpretation of the response.
// TODO: replace placeholder endpoint with the real trial-lesson lookup API once confirmed with backend.
export class TrialLessonMethods {
    constructor(private readonly request: APIRequestContext) { }

    async getTrialLessonByUserId(userId: string) {
        return this.request.get(`${env.apiBaseUrl}/users/${userId}/trial-lesson`);
    }
}
