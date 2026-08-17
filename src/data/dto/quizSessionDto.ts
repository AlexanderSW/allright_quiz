// Contract-level shape: only the fields that must hold for every A/B variant.
// Deliberately excludes step copy/order, which changes too often to assert on.
export interface QuizSessionDto {
    status: number;
    sessionId?: string;
    variant?: string;
    steps: unknown[];
}
