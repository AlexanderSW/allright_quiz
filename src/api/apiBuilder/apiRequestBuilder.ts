import { APIRequestContext, request as playwrightRequest } from '@playwright/test';
import { env } from '../../config/env';

// Central place to build API request contexts with a consistent base URL and
// headers, for callers (e.g. contract tests) that don't go through the
// `request` Playwright fixture.
export async function buildApiRequestContext(): Promise<APIRequestContext> {
    return playwrightRequest.newContext({
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
    });
}
