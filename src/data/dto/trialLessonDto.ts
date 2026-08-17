// Shape of the business outcome we assert on, independent of quiz UI/A-B variant.
export interface TrialLessonDto {
    booked: boolean;
    lessonId?: string;
    userId?: string;
}
