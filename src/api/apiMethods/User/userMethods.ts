import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';

// Raw HTTP call only — no business interpretation of the response.
// TODO: replace placeholder endpoint with the real user-lookup API once confirmed with backend.
export class UserMethods {
    constructor(private readonly request: APIRequestContext) { }

    async getUserByEmail(email: string) {
        return this.request.get(`${env.apiBaseUrl}/users`, { params: { email } });
    }
}
