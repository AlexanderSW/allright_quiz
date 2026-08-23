import { test, expect } from '../../src/fixtures/apiFixtures';
import { DashboardViewEventDto } from '../../src/data/dto/dashboardViewEventDto';
import { RegisterFunnelEventDto } from '../../src/data/dto/registerFunnelEventDto';
import { UnavailableSlotsEventDto } from '../../src/data/dto/unavailableSlotsEventDto';
import { buildDashboardViewEvent } from '../../src/data/factories/dashboardViewEventFactory';
import { buildRegisterFunnelEvent } from '../../src/data/factories/registerFunnelEventFactory';
import { buildUnavailableSlotsEvent } from '../../src/data/factories/unavailableSlotsEventFactory';
import { getJitsuConfig, sendJitsuTrackingEvent } from '../../src/api/apiUtils/jitsuTracking';

type QuizTrackingEventDto =
    | DashboardViewEventDto
    | RegisterFunnelEventDto
    | UnavailableSlotsEventDto;

const trackingCases: Array<{
    event: string;
    build: () => QuizTrackingEventDto;
}> = [
    { event: 'FRONTEND_REGISTER_FUNNEL', build: buildRegisterFunnelEvent },
    { event: 'FRONTEND_UNAVAILABLE_SLOTS', build: buildUnavailableSlotsEvent },
    { event: 'FRONTEND_DASHBOARD', build: buildDashboardViewEvent },
];

test.describe('Quiz tracking ingestion API contract', () => {
    for (const trackingCase of trackingCases) {
        test(`${trackingCase.event} is accepted by its configured stream`, async ({ request }) => {
            const jitsu = await getJitsuConfig(request);
            const event = trackingCase.build();
            const response = await sendJitsuTrackingEvent(request, jitsu, event);

            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual({ ok: true });
        });
    }
});
