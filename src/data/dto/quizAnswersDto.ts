// Answers a quiz run can be seeded with. Optional fields reflect that not
// every A/B variant asks every question.
export interface QuizAnswersDto {
    age?: number;
    email: string;
}
