import { APIRequestContext } from '@playwright/test';
import { TrialLessonMethods } from '../../apiMethods/TrialLesson/trialLessonMethods';
import { TrialLessonDto } from '../../../data/dto/trialLessonDto';

// Business-level API: turns raw responses into typed results tests assert on,
// independent of which A/B variant or step order produced the booking.
export class TrialLessonController {
    private readonly methods: TrialLessonMethods;

    constructor(request: APIRequestContext) {
        this.methods = new TrialLessonMethods(request);
    }

    async findByUserId(userId: string): Promise<TrialLessonDto> {
        const response = await this.methods.getTrialLessonByUserId(userId);
        if (!response.ok()) {
            return { booked: false, userId };
        }

        const body = await response.json();
        return { booked: Boolean(body?.id), lessonId: body?.id, userId };
    }
}
