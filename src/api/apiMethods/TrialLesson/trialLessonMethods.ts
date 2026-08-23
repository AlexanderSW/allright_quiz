import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import { CreateTrialLessonRequestDto } from '../../../data/dto/trialLessonDto';

export class TrialLessonMethods {
    constructor(private readonly request: APIRequestContext) { }

    async getAvailableTimeslots(accessToken: string, from: Date, to: Date) {
        return this.request.get(`${env.apiBaseUrl}/v1/available-timeslots`, {
            params: {
                attributes: 'timeStart',
                'filter[time][from]': '09:00',
                'filter[time][to]': '21:00',
                'filter[timeZone]': 'Europe/Kyiv',
                'filter[groupedByDays]': true,
                'filter[timeStart][from]': from.toISOString(),
                'filter[timeStart][to]': to.toISOString(),
            },
            headers: jsonApiHeaders(accessToken),
        });
    }

    async getTutorForTrial(accessToken: string) {
        return this.request.get(`${env.apiBaseUrl}/v1/users`, {
            params: { 'filter[get-tutor-for-trial]': true },
            headers: jsonApiHeaders(accessToken),
        });
    }

    async createTrialLesson(accessToken: string, body: CreateTrialLessonRequestDto) {
        return this.request.post(`${env.apiBaseUrl}/v1/lessons`, {
            data: body,
            headers: jsonApiHeaders(accessToken),
        });
    }

    async getTrialLessonsByUserId(userId: string, accessToken: string) {
        const params = new URLSearchParams();
        params.append('filter[student_id]', userId);
        params.append('filter[state][]', '0');
        params.append('filter[state][]', '1');
        params.append('filter[state][]', '2');
        params.append('filter[lesson_type][]', 'lesson');
        params.append('filter[order][0][]', 'time_start');
        params.append('filter[order][0][]', 'ASC');

        return this.request.get(`${env.apiBaseUrl}/v1/lessons`, {
            params,
            headers: jsonApiHeaders(accessToken),
        });
    }
}

function jsonApiHeaders(accessToken: string): Record<string, string> {
    return {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Accept-Language': 'uk',
        Authorization: `Bearer ${accessToken}`,
    };
}
