export interface TrialLessonDto {
    booked: boolean;
    lessonId?: string;
    userId?: string;
    tutorId?: number;
    timeStart?: string;
}

export interface AvailableTimeslotDto {
    type: 'available-timeslot';
    id: string;
    attributes: {
        'time-start': string;
    };
}

export interface AvailableTimeslotsResponseDto {
    data: AvailableTimeslotDto[];
}

export interface TrialTutorResponseDto {
    data: {
        type: 'users';
        id: string;
        attributes: Record<string, unknown>;
    };
}

export interface CreateTrialLessonRequestDto {
    data: {
        type: 'lessons';
        attributes: {
            'time-start': string;
            'time-end': string;
            'tutor-id': number;
            'student-id': number;
            'is-paid': 0;
            state: 1;
            'is-visible-student-review': true;
            'is-visible-admin-review': true;
            'is-send-cancel-details-to-student': false;
            'is-short-review': true;
            'is-first': false;
            'book-next-after-pay': false;
            'can-record': false;
            'is-record': false;
            'lesson-in-zoom': false;
            'is-blended': false;
            'is-main-speaking': false;
        };
    };
}

export interface JsonApiLessonResourceDto {
    type: 'lessons';
    id: string;
    attributes: {
        'time-start': string;
        'time-end': string;
        'tutor-id': number;
        'student-id': number;
        'lesson-type-id': number;
        'is-paid': number;
        state: number;
        'is-first': boolean;
        subject: string;
        [key: string]: unknown;
    };
}

export interface CreateTrialLessonResponseDto {
    data: JsonApiLessonResourceDto;
}

export interface TrialLessonsResponseDto {
    data: JsonApiLessonResourceDto[];
}
