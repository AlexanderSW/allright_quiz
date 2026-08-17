import { faker } from '@faker-js/faker';
import { RegisterFunnelEventDto } from '../dto/registerFunnelEventDto';

export function buildRegisterFunnelEvent(overrides: Partial<RegisterFunnelEventDto> = {}): RegisterFunnelEventDto {
    const now = new Date().toISOString();
    const step = faker.helpers.arrayElement(['age-range', 'child-know-english', 'goal', 'schedule']);

    return {
        type: 'track',
        event: 'FRONTEND_REGISTER_FUNNEL',
        properties: {
            eventName: step,
            state: 'WATCHED',
            target: 'vcharlie',
            targetType: null,
            funnelType: 'long',
            fragment: faker.number.int({ min: 1, max: 10 }),
            transition: { from: 'age-range', to: step },
            transitionFromAnswer: faker.number.int({ min: 1, max: 20 }),
        },
        userId: 'undefined',
        anonymousId: faker.string.uuid(),
        timestamp: now,
        sentAt: now,
        messageId: faker.string.uuid(),
        writeKey: 'test-write-key',
        context: {
            library: { name: '@jitsu/js', version: '2.0.0', env: 'browser' },
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
            locale: 'en-US',
            screen: { width: 1920, height: 1080, innerWidth: 1920, innerHeight: 675, density: 1 },
            traits: { id: 'undefined' },
            page: {
                path: `/uk/app/sign-up/long/charlie/${step}`,
                referrer: '',
                referring_domain: '',
                host: 'stage.allright.com',
                search: '',
                title: 'Онлайн школа англійської мови для дітей All Right',
                url: `https://stage.allright.com/uk/app/sign-up/long/charlie/${step}`,
                encoding: 'UTF-8',
            },
            clientIds: { ga4: { clientId: faker.string.numeric(9) + '.' + faker.string.numeric(10), sessionIds: {} } },
            campaign: {},
        },
        ...overrides,
    };
}
