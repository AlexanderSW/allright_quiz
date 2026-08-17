// Central place for environment-specific config so tests never hardcode URLs.
export const env = {
    baseUrl: process.env.QUIZ_BASE_URL ?? 'https://stage.allright.com',
    quizStartPath: '/uk/app/sign-up/long/charlie/age-range',
    // Backend endpoints used to verify quiz business outcomes (user + trial lesson).
    // TODO: confirm real paths/host with backend team — placeholders for now.
    apiBaseUrl: process.env.QUIZ_API_BASE_URL ?? 'https://stage.allright.com/api',
};

export function quizStartUrl(): string {
    return `${env.baseUrl}${env.quizStartPath}`;
}
