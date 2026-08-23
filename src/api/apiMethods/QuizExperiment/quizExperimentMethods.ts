import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';

export interface QuizExperimentQuery {
    alias: string;
    market: string;
}

export class QuizExperimentMethods {
    constructor(private readonly request: APIRequestContext) { }

    async getExperiment({ alias, market }: QuizExperimentQuery) {
        return this.request.get(`${env.apiBaseUrl}/v1/experiments`, {
            headers: {
                Accept: 'application/vnd.api+json',
                'Accept-Language': market,
            },
            params: {
                'filter[by_alias]': alias,
                'filter[market]': market,
            },
        });
    }
}
