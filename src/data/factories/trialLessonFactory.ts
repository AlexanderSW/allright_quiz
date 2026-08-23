import { CreateTrialLessonRequestDto } from '../dto/trialLessonDto';

export function buildTrialLessonRequest(
    studentId: string,
    tutorId: string,
    availableTimeStart: string,
): CreateTrialLessonRequestDto {
    const timeStart = new Date(availableTimeStart);
    if (Number.isNaN(timeStart.getTime())) {
        throw new Error(`Invalid trial lesson time: ${availableTimeStart}`);
    }

    const timeEnd = new Date(timeStart.getTime() + 29 * 60 * 1000);

    return {
        data: {
            type: 'lessons',
            attributes: {
                'time-start': timeStart.toISOString(),
                'time-end': timeEnd.toISOString(),
                'tutor-id': Number(tutorId),
                'student-id': Number(studentId),
                'is-paid': 0,
                state: 1,
                'is-visible-student-review': true,
                'is-visible-admin-review': true,
                'is-send-cancel-details-to-student': false,
                'is-short-review': true,
                'is-first': false,
                'book-next-after-pay': false,
                'can-record': false,
                'is-record': false,
                'lesson-in-zoom': false,
                'is-blended': false,
                'is-main-speaking': false,
            },
        },
    };
}
