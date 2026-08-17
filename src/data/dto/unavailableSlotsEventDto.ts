export interface UnavailableSlotsEventDto {
    type: string;
    event: string;
    properties: {
        result: string;
        target: string;
        tutor_id: string | null;
        time_start: string;
        time_zone: string;
        filter: string;
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
            name: string;
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
