import { faker } from '@faker-js/faker';
import { DashboardViewEventDto } from '../dto/dashboardViewEventDto';

export function buildDashboardViewEvent(overrides: Partial<DashboardViewEventDto> = {}): DashboardViewEventDto {
    const now = new Date().toISOString();

    return {
        type: 'track',
        event: 'FRONTEND_DASHBOARD',
        properties: { eventName: 'SHOW' },
        userId: String(Math.floor(Math.random() * 1_000_000)),
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
            traits: { id: '853881', name: 'Test User' },
            page: {
                path: '/uk/app/dashboard',
                referrer: '',
                referring_domain: '',
                host: 'stage.allright.com',
                search: '',
                title: 'Онлайн школа англійської мови для дітей All Right',
                url: 'https://stage.allright.com/uk/app/dashboard',
                encoding: 'UTF-8',
            },
            clientIds: { ga4: { clientId: '827210783.1786893541', sessionIds: {} } },
            campaign: {},
        },
        ...overrides,
    };
}
