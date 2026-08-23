import { faker } from '@faker-js/faker';
import { DashboardViewEventDto } from '../dto/dashboardViewEventDto';
import { RegisterFunnelEventDto } from '../dto/registerFunnelEventDto';
import { UnavailableSlotsEventDto } from '../dto/unavailableSlotsEventDto';
import { buildDashboardViewEvent } from './dashboardViewEventFactory';
import { buildRegisterFunnelEvent } from './registerFunnelEventFactory';
import { buildUnavailableSlotsEvent } from './unavailableSlotsEventFactory';

const STAGE_BASE_URL = 'https://stage.allright.com';
const CHARLIE_QUIZ_PATH = '/uk/app/sign-up/long/charlie';
const PAGE_TITLE = 'Онлайн школа англійської мови для дітей All Right';

export interface QuizTrackingJourney {
    steps: string[];
    registerEvents: RegisterFunnelEventDto[];
    unavailableSlotsEvent: UnavailableSlotsEventDto;
    dashboardEvent: DashboardViewEventDto;
    identity: {
        anonymousId: string;
        userId: string;
        gaClientId: string;
        userName: string;
    };
}

export function buildQuizTrackingJourney(steps: string[]): QuizTrackingJourney {
    if (steps.length === 0) {
        throw new Error('At least one quiz step is required');
    }

    const anonymousId = faker.string.uuid();
    const userId = faker.string.numeric(6);
    const userName = `API Contract ${faker.person.firstName()}`;
    const gaClientId = `${faker.string.numeric(9)}.${faker.string.numeric(10)}`;
    const journeyStartedAt = Date.now();
    const phoneStepIndex = steps.indexOf('user-info-phone');

    const registerEvents = steps.map((step, index) => {
        const baseEvent = buildRegisterFunnelEvent();
        const pagePath = `${CHARLIE_QUIZ_PATH}/${step}`;
        const isRegistered = phoneStepIndex >= 0 && index > phoneStepIndex;
        const eventUserId = isRegistered ? userId : 'undefined';
        const timestamp = new Date(journeyStartedAt + index).toISOString();

        return {
            ...baseEvent,
            properties: {
                ...baseEvent.properties,
                eventName: step,
                fragment: index + 1,
                transition: index === 0
                    ? { to: step }
                    : { from: steps[index - 1], to: step },
                transitionFromAnswer: index === 0 ? null : index,
                experiment: {
                    alias: 'QUIZ_CHARLIE_VS_PERSONALIZED',
                    variant: 'A',
                },
            },
            userId: eventUserId,
            anonymousId,
            timestamp,
            sentAt: timestamp,
            context: {
                ...baseEvent.context,
                traits: { id: eventUserId },
                page: {
                    ...baseEvent.context.page,
                    path: pagePath,
                    title: PAGE_TITLE,
                    url: `${STAGE_BASE_URL}${pagePath}`,
                },
                clientIds: {
                    ga4: {
                        clientId: gaClientId,
                        sessionIds: {},
                    },
                },
            },
        };
    });

    const lastStepPath = `${CHARLIE_QUIZ_PATH}/${steps.at(-1)}`;
    const unavailableBase = buildUnavailableSlotsEvent();
    const unavailableTimestamp = new Date(journeyStartedAt + steps.length).toISOString();
    const unavailableSlotsEvent: UnavailableSlotsEventDto = {
        ...unavailableBase,
        userId,
        anonymousId,
        timestamp: unavailableTimestamp,
        sentAt: unavailableTimestamp,
        context: {
            ...unavailableBase.context,
            traits: { id: userId, name: userName },
            page: {
                ...unavailableBase.context.page,
                path: lastStepPath,
                title: PAGE_TITLE,
                url: `${STAGE_BASE_URL}${lastStepPath}`,
            },
            clientIds: {
                ga4: {
                    clientId: gaClientId,
                    sessionIds: {},
                },
            },
        },
    };

    const dashboardBase = buildDashboardViewEvent();
    const dashboardTimestamp = new Date(journeyStartedAt + steps.length + 1).toISOString();
    const dashboardEvent: DashboardViewEventDto = {
        ...dashboardBase,
        userId,
        anonymousId,
        timestamp: dashboardTimestamp,
        sentAt: dashboardTimestamp,
        context: {
            ...dashboardBase.context,
            traits: { id: userId, name: userName },
            page: {
                ...dashboardBase.context.page,
                title: PAGE_TITLE,
            },
            clientIds: {
                ga4: {
                    clientId: gaClientId,
                    sessionIds: {},
                },
            },
        },
    };

    return {
        steps: [...steps],
        registerEvents,
        unavailableSlotsEvent,
        dashboardEvent,
        identity: { anonymousId, userId, gaClientId, userName },
    };
}

// The frontend starts the funnel anonymously and switches to the real backend
// user immediately after the phone step creates the account.
export function bindRegisteredUserToJourney(
    journey: QuizTrackingJourney,
    userId: string,
    userName: string,
): void {
    const phoneStepIndex = journey.steps.indexOf('user-info-phone');
    if (phoneStepIndex < 0) {
        throw new Error('Cannot bind a registered user: user-info-phone is missing from quiz steps');
    }

    journey.identity.userId = userId;
    journey.identity.userName = userName;

    for (const event of journey.registerEvents.slice(phoneStepIndex + 1)) {
        event.userId = userId;
        event.context.traits.id = userId;
    }

    for (const event of [journey.unavailableSlotsEvent, journey.dashboardEvent]) {
        event.userId = userId;
        event.context.traits = { id: userId, name: userName };
    }
}
