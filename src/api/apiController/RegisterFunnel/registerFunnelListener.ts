import { Page, Request } from '@playwright/test';
import { RegisterFunnelEventDto } from '../../../data/dto/registerFunnelEventDto';
import { assertValidRegisterFunnelEvent } from '../../../data/validators/registerFunnelEventValidator';

const TRACK_ENDPOINT_PATH = '/api/s/track';

export interface RegisterFunnelCapture {
    event: RegisterFunnelEventDto;
    responseStatus: number;
    responseBody: unknown;
}

// Captures the FRONTEND_REGISTER_FUNNEL analytics beacon the quiz frontend
// fires on every step transition, and validates it against the contract in
// registerFunnelEventDto.ts. This is a browser-emitted event, not a backend
// endpoint tests call directly, so it listens on the page's own network
// traffic instead of using APIRequestContext like the other controllers.
export class RegisterFunnelListener {
    constructor(private readonly page: Page) { }

    // fromStep pins the capture to the transition caused by `action`, since the
    // quiz also fires a FRONTEND_REGISTER_FUNNEL "WATCHED" event on initial page
    // load (with no transition.from) that would otherwise race with it.
    async captureDuring(fromStep: string, action: () => Promise<void>): Promise<RegisterFunnelCapture> {
        const requestPromise = this.page.waitForRequest((request) => this.isRegisterFunnelTransitionRequest(request, fromStep));
        await action();
        const request = await requestPromise;
        const payload = JSON.parse(request.postData() ?? '{}');
        const event = assertValidRegisterFunnelEvent(payload);

        const response = await request.response();
        if (!response) {
            throw new Error('Register-funnel request did not receive a response');
        }

        return {
            event,
            responseStatus: response.status(),
            responseBody: await response.json(),
        };
    }

    private isRegisterFunnelTransitionRequest(request: Request, fromStep: string): boolean {
        if (request.method() !== 'POST' || !request.url().includes(TRACK_ENDPOINT_PATH)) {
            return false;
        }
        try {
            const body = JSON.parse(request.postData() ?? '');
            return body?.event === 'FRONTEND_REGISTER_FUNNEL' && body?.properties?.transition?.from === fromStep;
        } catch {
            return false;
        }
    }
}
