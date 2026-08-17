import { uniqueTestEmail, randomAge } from '../../api/apiUtils/random';
import { QuizAnswersDto } from '../dto/quizAnswersDto';

// Builds throwaway quiz answers so parallel/repeat runs never collide, and so
// accounts created on stage are easy to identify and clean up.
export function buildQuizAnswers(overrides: Partial<QuizAnswersDto> = {}): QuizAnswersDto {
    return {
        email: uniqueTestEmail(),
        age: randomAge(),
        ...overrides,
    };
}
