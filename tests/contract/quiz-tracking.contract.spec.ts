import { APIRequestContext } from '@playwright/test';
import { test, expect } from '../../src/fixtures/apiFixtures';
import { env, quizStartUrl } from '../../src/config/env';
import { DashboardViewEventDto } from '../../src/data/dto/dashboardViewEventDto';
import { RegisterFunnelEventDto } from '../../src/data/dto/registerFunnelEventDto';
import { UnavailableSlotsEventDto } from '../../src/data/dto/unavailableSlotsEventDto';
import { buildDashboardViewEvent } from '../../src/data/factories/dashboardViewEventFactory';
import { buildRegisterFunnelEvent } from '../../src/data/factories/registerFunnelEventFactory';
import { buildUnavailableSlotsEvent } from '../../src/data/factories/unavailableSlotsEventFactory';

type QuizTrackingEventDto =
    | DashboardViewEventDto
    | RegisterFunnelEventDto
    | UnavailableSlotsEventDto;

interface JitsuConfig {
    host: string;
    writeKey: string;
    datasetsConfigs: Array<{
        eventName: string[];
        writeKey: string;
    }>;
}

interface FrontendConfig {
    jitsu: JitsuConfig;
}

const trackingCases: Array<{
    eventName: string;
    build: () => QuizTrackingEventDto;
}> = [
    { eventName: 'FRONTEND_REGISTER_FUNNEL', build: buildRegisterFunnelEvent },
    { eventName: 'FRONTEND_UNAVAILABLE_SLOTS', build: buildUnavailableSlotsEvent },
    { eventName: 'FRONTEND_DASHBOARD', build: buildDashboardViewEvent },
];

test.describe('Quiz tracking ingestion API contract', () => {
    for (const trackingCase of trackingCases) {
        test(`${trackingCase.eventName} is accepted by its configured stream`, async ({ request }) => {
            const jitsu = await getJitsuConfig(request);
            const writeKey = getWriteKey(jitsu, trackingCase.eventName);
            const event = trackingCase.build();
            event.writeKey = writeKey;

            const response = await request.post(`${jitsu.host}/api/s/track`, {
                headers: {
                    Origin: env.baseUrl!,
                    Referer: `${env.baseUrl}/`,
                    'x-write-key': writeKey,
                },
                data: event,
            });

            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual({ ok: true });
        });
    }
});

async function getJitsuConfig(request: APIRequestContext): Promise<JitsuConfig> {
    const response = await request.get(quizStartUrl());
    if (!response.ok()) {
        throw new Error(`Could not load frontend config: HTTP ${response.status()}`);
    }

    const html = await response.text();
    const metaTag = html.match(/<meta\b[^>]*\bname=["']frontend\/config\/environment["'][^>]*>/i)?.[0];
    const encodedConfig = metaTag?.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (!encodedConfig) {
        throw new Error('Could not find frontend/config/environment meta content');
    }

    const config = JSON.parse(decodeURIComponent(encodedConfig)) as Partial<FrontendConfig>;
    if (
        !config.jitsu
        || typeof config.jitsu.host !== 'string'
        || typeof config.jitsu.writeKey !== 'string'
        || !Array.isArray(config.jitsu.datasetsConfigs)
    ) {
        throw new Error('Frontend config does not contain a valid Jitsu configuration');
    }

    return config.jitsu;
}

function getWriteKey(config: JitsuConfig, frontendEventName: string): string {
    const eventName = frontendEventName.replace(/^FRONTEND_/, '');
    const dataset = config.datasetsConfigs.find(({ eventName: configuredEvents }) =>
        configuredEvents.some((configuredEvent) => eventName.includes(configuredEvent)),
    );

    return dataset?.writeKey ?? config.writeKey;
}
