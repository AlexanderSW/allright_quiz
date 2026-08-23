import fs from 'fs';
import path from 'path';
import { test, expect } from '../../src/fixtures/apiFixtures';
import { getJitsuConfig, sendJitsuTrackingEvent } from '../../src/api/apiUtils/jitsuTracking';
import {
    bindRegisteredUserToJourney,
    buildQuizTrackingJourney,
} from '../../src/data/factories/quizTrackingJourneyFactory';
import { buildTrialLessonRequest } from '../../src/data/factories/trialLessonFactory';
import { buildUserRegistrationFixture } from '../../src/data/factories/userRegistrationFactory';
import { assertValidRegisterFunnelEvent } from '../../src/data/validators/registerFunnelEventValidator';

const STEPS_FILE = path.resolve(__dirname, '../../requests_responses/list_of_steps.txt');
const CHARLIE_QUIZ_PATH = '/uk/app/sign-up/long/charlie';

test.describe('Complete Charlie quiz tracking journey through API', () => {
    test('passes every step, creates a user and books a trial lesson without a browser', async ({
        request,
        quizApiClient,
    }) => {
        test.setTimeout(60_000);

        const steps = loadQuizSteps();
        const journey = buildQuizTrackingJourney(steps);
        const registration = buildUserRegistrationFixture();
        const jitsu = await getJitsuConfig(request);
        const acceptedSteps: string[] = [];
        let userId: string | undefined;
        let accessToken: string | undefined;

        expect(journey.registerEvents).toHaveLength(steps.length);

        for (const [index, event] of journey.registerEvents.entries()) {
            const step = steps[index];
            const expectedPath = `${CHARLIE_QUIZ_PATH}/${step}`;

            expect(event.properties.eventName).toBe(step);
            expect(event.properties.fragment).toBe(index + 1);
            expect(event.properties.transition).toEqual(
                index === 0
                    ? { to: step }
                    : { from: steps[index - 1], to: step },
            );
            expect(event.context.page.path).toBe(expectedPath);
            expect(event.context.page.url).toBe(`https://stage.allright.com${expectedPath}`);
            expect(event.anonymousId).toBe(journey.identity.anonymousId);
            expect(event.context.clientIds.ga4.clientId).toBe(journey.identity.gaClientId);
            assertValidRegisterFunnelEvent(event);

            const response = await sendJitsuTrackingEvent(request, jitsu, event);
            expect(response.status()).toBe(200);
            expect(await response.json()).toEqual({ ok: true });
            acceptedSteps.push(event.properties.eventName);

            if (step === 'user-info-phone') {
                const user = await quizApiClient.user.create(registration);
                expect(user).toMatchObject({
                    exists: true,
                    phone: registration.phone.replace(/^\+/, ''),
                    name: registration.name,
                });
                expect(user.userId).toMatch(/^\d+$/);

                userId = user.userId!;
                const token = await quizApiClient.user.authenticate(user.phone!, registration.password);
                expect(String(token.user_id)).toBe(userId);
                expect(token.token_type).toBe('Bearer');
                expect(token.access_token).toBeTruthy();
                accessToken = token.access_token;

                bindRegisteredUserToJourney(journey, userId, registration.name);
            }

            if (step === 'user-info-email') {
                expect(userId).toBeTruthy();
                expect(accessToken).toBeTruthy();
                const updatedUser = await quizApiClient.user.updateEmail(
                    userId!,
                    registration.email,
                    accessToken!,
                );
                expect(updatedUser.email).toBe(registration.email);
            }
        }

        expect(acceptedSteps).toEqual(steps);
        expect(userId).toBeTruthy();
        expect(accessToken).toBeTruthy();

        const currentUser = await quizApiClient.user.getCurrent(accessToken!);
        expect(currentUser).toMatchObject({
            exists: true,
            userId,
            email: registration.email,
        });

        const timeslots = await quizApiClient.trialLesson.getAvailableTimeslots(accessToken!);
        expect(timeslots.length).toBeGreaterThan(0);
        const selectedTimeslot = timeslots.at(-1)!;
        expect(selectedTimeslot.type).toBe('available-timeslot');
        expect(Date.parse(selectedTimeslot.attributes['time-start'])).not.toBeNaN();

        await quizApiClient.user.updateLessonDateWishes(
            userId!,
            selectedTimeslot.attributes['time-start'],
            accessToken!,
        );

        const tutor = await quizApiClient.trialLesson.getTutorForTrial(accessToken!);
        expect(tutor.type).toBe('users');
        expect(tutor.id).toMatch(/^\d+$/);

        const lessonRequest = buildTrialLessonRequest(
            userId!,
            tutor.id,
            selectedTimeslot.attributes['time-start'],
        );
        const createdLesson = await quizApiClient.trialLesson.create(accessToken!, lessonRequest);
        expect(createdLesson).toMatchObject({
            booked: true,
            userId,
            tutorId: Number(tutor.id),
            timeStart: lessonRequest.data.attributes['time-start'],
        });
        expect(createdLesson.lessonId).toMatch(/^\d+$/);

        const persistedLesson = await quizApiClient.trialLesson.findByUserId(userId!, accessToken!);
        expect(persistedLesson).toMatchObject({
            booked: true,
            lessonId: createdLesson.lessonId,
            userId,
        });

        journey.unavailableSlotsEvent.properties.result = JSON.stringify(
            timeslots.map((slot) => slot.attributes['time-start']),
        );
        journey.unavailableSlotsEvent.properties.tutor_id = tutor.id;
        journey.unavailableSlotsEvent.properties.time_start = selectedTimeslot.attributes['time-start'];

        const unavailableSlotsResponse = await sendJitsuTrackingEvent(
            request,
            jitsu,
            journey.unavailableSlotsEvent,
        );
        expect(unavailableSlotsResponse.status()).toBe(200);
        expect(await unavailableSlotsResponse.json()).toEqual({ ok: true });
        expect(journey.unavailableSlotsEvent.userId).toBe(journey.identity.userId);
        expect(journey.unavailableSlotsEvent.anonymousId).toBe(journey.identity.anonymousId);
        expect(journey.unavailableSlotsEvent.context.page.path).toBe(
            `${CHARLIE_QUIZ_PATH}/${steps.at(-1)}`,
        );
        expect(JSON.parse(journey.unavailableSlotsEvent.properties.result)).toEqual(expect.any(Array));
        expect(JSON.parse(journey.unavailableSlotsEvent.properties.target)).toEqual(expect.any(Array));
        expect(JSON.parse(journey.unavailableSlotsEvent.properties.filter)).toEqual(expect.any(Object));

        const dashboardResponse = await sendJitsuTrackingEvent(
            request,
            jitsu,
            journey.dashboardEvent,
        );
        expect(dashboardResponse.status()).toBe(200);
        expect(await dashboardResponse.json()).toEqual({ ok: true });
        expect(journey.dashboardEvent.userId).toBe(journey.identity.userId);
        expect(journey.dashboardEvent.anonymousId).toBe(journey.identity.anonymousId);
        expect(journey.dashboardEvent.properties.eventName).toBe('SHOW');
        expect(journey.dashboardEvent.context.page.path).toBe('/uk/app/dashboard');
    });
});

function loadQuizSteps(): string[] {
    const steps = fs.readFileSync(STEPS_FILE, 'utf8')
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean);

    if (steps.length === 0) {
        throw new Error(`No quiz steps found in ${STEPS_FILE}`);
    }
    if (new Set(steps).size !== steps.length) {
        throw new Error(`Quiz steps must be unique in ${STEPS_FILE}`);
    }

    return steps;
}
