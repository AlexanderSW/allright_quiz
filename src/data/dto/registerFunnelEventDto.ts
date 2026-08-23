export interface RegisterFunnelEventDto {
    type: string;
    event: string;
    properties: {
        eventName: string;
        state: string;
        target: string;
        targetType: string | null;
        funnelType: string;
        fragment: number;
        transition: {
            // The initial WATCHED event has only `to`; transition events also
            // include `from`.
            from?: string;
            to: string;
        };
        transitionFromAnswer: number | string | null;
        [key: string]: unknown;
    };
    userId: string;
    anonymousId: string;
    timestamp: string;
    sentAt: string;
    messageId: string;
    writeKey: string;
    context: {
        library: {
            name: string;
            version: string;
            env: string;
        };
        userAgent: string;
        locale: string;
        screen: {
            width: number;
            height: number;
            innerWidth: number;
            innerHeight: number;
            density: number;
        };
        traits: {
            id: string;
        };
        page: {
            path: string;
            referrer: string;
            referring_domain: string;
            host: string;
            search: string;
            title: string;
            url: string;
            encoding: string;
        };
        clientIds: {
            ga4: {
                clientId: string;
                sessionIds: Record<string, string>;
            };
        };
        campaign: Record<string, unknown>;
    };
}
