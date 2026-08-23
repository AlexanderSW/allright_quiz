import { APIRequestContext, APIResponse } from '@playwright/test';
import { TrialLessonMethods } from '../../apiMethods/TrialLesson/trialLessonMethods';
import {
    AvailableTimeslotDto,
    AvailableTimeslotsResponseDto,
    CreateTrialLessonRequestDto,
    CreateTrialLessonResponseDto,
    TrialLessonDto,
    TrialLessonsResponseDto,
    TrialTutorResponseDto,
} from '../../../data/dto/trialLessonDto';

export class TrialLessonController {
    private readonly methods: TrialLessonMethods;

    constructor(request: APIRequestContext) {
        this.methods = new TrialLessonMethods(request);
    }

    async getAvailableTimeslots(accessToken: string): Promise<AvailableTimeslotDto[]> {
        const from = new Date();
        const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
        const response = await this.methods.getAvailableTimeslots(accessToken, from, to);
        const body = await parseResponse<AvailableTimeslotsResponseDto>(
            response,
            'get available trial lesson timeslots',
        );
        return body.data;
    }

    async getTutorForTrial(accessToken: string): Promise<TrialTutorResponseDto['data']> {
        const response = await this.methods.getTutorForTrial(accessToken);
        const body = await parseResponse<TrialTutorResponseDto>(response, 'get tutor for trial lesson');
        return body.data;
    }

    async create(
        accessToken: string,
        body: CreateTrialLessonRequestDto,
    ): Promise<TrialLessonDto> {
        const response = await this.methods.createTrialLesson(accessToken, body);
        const result = await parseResponse<CreateTrialLessonResponseDto>(
            response,
            'create trial lesson',
        );
        return mapLesson(result.data);
    }

    async findByUserId(userId: string, accessToken?: string): Promise<TrialLessonDto> {
        if (!accessToken) {
            return { booked: false, userId };
        }

        const response = await this.methods.getTrialLessonsByUserId(userId, accessToken);
        const body = await parseResponse<TrialLessonsResponseDto>(response, 'get trial lesson by user');
        const lesson = body.data[0];
        return lesson ? mapLesson(lesson) : { booked: false, userId };
    }
}

function mapLesson(resource: CreateTrialLessonResponseDto['data']): TrialLessonDto {
    return {
        booked: true,
        lessonId: resource.id,
        userId: String(resource.attributes['student-id']),
        tutorId: resource.attributes['tutor-id'],
        timeStart: resource.attributes['time-start'],
    };
}

async function parseResponse<T>(response: APIResponse, action: string): Promise<T> {
    const text = await response.text();
    if (!response.ok()) {
        throw new Error(`Failed to ${action}: ${response.status()} ${text}`);
    }
    return JSON.parse(text) as T;
}
