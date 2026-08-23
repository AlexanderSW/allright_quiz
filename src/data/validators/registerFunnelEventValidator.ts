import { RegisterFunnelEventDto } from '../dto/registerFunnelEventDto';

// Structural contract check for the FRONTEND_REGISTER_FUNNEL beacon: verifies
// the fields tests rely on are present with the right shape, without pinning
// down step-specific values (eventName, transition targets, answers) that
// change across A/B variants and quiz steps.
export function assertValidRegisterFunnelEvent(payload: unknown): RegisterFunnelEventDto {
    const event = payload as Partial<RegisterFunnelEventDto>;

    if (event.type !== 'track') {
        throw new Error(`Expected "type" to be "track", got ${JSON.stringify(event.type)}`);
    }
    if (event.event !== 'FRONTEND_REGISTER_FUNNEL') {
        throw new Error(`Expected "event" to be "FRONTEND_REGISTER_FUNNEL", got ${JSON.stringify(event.event)}`);
    }

    const properties = event.properties;
    if (!properties || typeof properties !== 'object') {
        throw new Error('Missing "properties" object');
    }
    if (typeof properties.eventName !== 'string') {
        throw new Error('"properties.eventName" must be a string');
    }
    if (typeof properties.state !== 'string') {
        throw new Error('"properties.state" must be a string');
    }
    if (typeof properties.funnelType !== 'string') {
        throw new Error('"properties.funnelType" must be a string');
    }
    if (typeof properties.fragment !== 'number') {
        throw new Error('"properties.fragment" must be a number');
    }
    if (
        !properties.transition
        || typeof properties.transition.to !== 'string'
        || (
            properties.transition.from !== undefined
            && typeof properties.transition.from !== 'string'
        )
    ) {
        throw new Error('"properties.transition" must have string "to" and optional string "from"');
    }

    if (typeof event.anonymousId !== 'string') {
        throw new Error('"anonymousId" must be a string');
    }
    if (typeof event.timestamp !== 'string') {
        throw new Error('"timestamp" must be a string');
    }
    if (typeof event.messageId !== 'string') {
        throw new Error('"messageId" must be a string');
    }
    if (typeof event.writeKey !== 'string') {
        throw new Error('"writeKey" must be a string');
    }

    const context = event.context;
    if (!context || typeof context !== 'object') {
        throw new Error('Missing "context" object');
    }
    if (!context.page || typeof context.page.path !== 'string' || typeof context.page.url !== 'string') {
        throw new Error('"context.page" must have string "path" and "url"');
    }

    return event as RegisterFunnelEventDto;
}
