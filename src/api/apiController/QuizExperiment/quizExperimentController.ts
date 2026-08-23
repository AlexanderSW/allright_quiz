import { APIRequestContext } from '@playwright/test';
import {
    QuizExperimentMethods,
    QuizExperimentQuery,
} from '../../apiMethods/QuizExperiment/quizExperimentMethods';
import { QuizExperimentResponseDto } from '../../../data/dto/quizExperimentDto';
import { assertValidQuizExperimentResponse } from '../../../data/validators/quizExperimentValidator';

export interface QuizExperimentResult {
    status: number;
    body?: QuizExperimentResponseDto;
}

export class QuizExperimentController {
    private readonly methods: QuizExperimentMethods;

    constructor(request: APIRequestContext) {
        this.methods = new QuizExperimentMethods(request);
    }

    async getExperiment(query: QuizExperimentQuery): Promise<QuizExperimentResult> {
        const response = await this.methods.getExperiment(query);

        return {
            status: response.status(),
            body: response.ok()
                ? assertValidQuizExperimentResponse(await response.json())
                : undefined,
        };
    }
}
