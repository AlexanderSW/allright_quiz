// Generates unique, throwaway test data so parallel/repeat runs never collide
// and so real accounts created on stage are easy to identify and clean up.
export function uniqueTestEmail(prefix = 'qa-quiz'): string {
    const stamp = Date.now();
    const rand = Math.floor(Math.random() * 1e6);
    return `${prefix}+${stamp}-${rand}@example.com`;
}

export function randomAge(min = 18, max = 65): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
