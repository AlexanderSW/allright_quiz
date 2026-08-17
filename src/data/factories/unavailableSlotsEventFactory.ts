import { faker } from '@faker-js/faker';
import { UnavailableSlotsEventDto } from '../dto/unavailableSlotsEventDto';

function buildSlots(daysFromNow: number, count: number): string[] {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + daysFromNow);
    start.setUTCHours(8, 0, 0, 0);

    return Array.from({ length: count }, (_, i) => {
        const slot = new Date(start.getTime() + i * 30 * 60 * 1000);
        return slot.toISOString();
    });
}

export function buildUnavailableSlotsEvent(overrides: Partial<UnavailableSlotsEventDto> = {}): UnavailableSlotsEventDto {
    const now = new Date();
    const nowIso = now.toISOString();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        type: 'track',
        event: 'FRONTEND_UNAVAILABLE_SLOTS',
        properties: {
            result: JSON.stringify(buildSlots(faker.number.int({ min: 1, max: 6 }), faker.number.int({ min: 5, max: 30 }))),
            target: JSON.stringify(buildSlots(0, faker.number.int({ min: 5, max: 30 }))),
            tutor_id: null,
            time_start: nowIso,
            time_zone: 'Europe/Kyiv',
            filter: JSON.stringify({
                time: { from: '09:00', to: '21:00' },
                timeZone: 'Europe/Kyiv',
                groupedByDays: true,
                timeStart: { from: nowIso, to: weekFromNow },
            }),
        },
        userId: faker.string.numeric(6),
        anonymousId: faker.string.uuid(),
        timestamp: nowIso,
        sentAt: nowIso,
        messageId: faker.string.uuid(),
        writeKey: 'test-write-key',
        context: {
            library: { name: '@jitsu/js', version: '2.0.0', env: 'browser' },
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
            locale: 'en-US',
            screen: { width: 1920, height: 1080, innerWidth: 1920, innerHeight: 675, density: 1 },
            traits: { id: faker.string.numeric(6), name: faker.person.firstName() },
            page: {
                path: '/uk/app/sign-up/long/charlie/lesson-time-select',
                referrer: '',
                referring_domain: '',
                host: 'stage.allright.com',
                search: '',
                title: 'Онлайн школа англійської мови для дітей All Right',
                url: 'https://stage.allright.com/uk/app/sign-up/long/charlie/lesson-time-select',
                encoding: 'UTF-8',
            },
            clientIds: { ga4: { clientId: faker.string.numeric(9) + '.' + faker.string.numeric(10), sessionIds: {} } },
            campaign: {},
        },
        ...overrides,
    };
}
