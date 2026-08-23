// Central place for environment-specific config so tests never hardcode URLs.
export const env = {
    baseUrl: process.env.QUIZ_BASE_URL,
    // This entry route asks the experiment API for the active funnel and then
    // redirects to the selected 13/21-step (or future) quiz variant.
    quizStartPath: '/uk/app/sign-up/long/personalized/age-range',
    // Backend endpoints used to verify quiz business outcomes (user + trial lesson).
    // TODO: confirm real paths/host with backend team — placeholders for now.
    apiBaseUrl: process.env.QUIZ_API_BASE_URL,
};

export function quizStartUrl(): string {
    return `${env.baseUrl}${env.quizStartPath}`;
}
