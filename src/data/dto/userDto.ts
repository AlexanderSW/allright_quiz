export interface UserDto {
    exists: boolean;
    userId?: string;
    email?: string | null;
    phone?: string;
    name?: string;
    userMetaId?: string;
}

export interface UserRegistrationFixture {
    request: CreateUserRequestDto;
    email: string;
    password: string;
    phone: string;
    name: string;
    childName: string;
}

export interface CreateUserRequestDto {
    data: {
        type: 'users';
        attributes: {
            [key: string]: unknown;
            'created-at': null;
            name: string;
            'name-latin': null;
            'last-name': null;
            email: null;
            'new-email': null;
            password: string;
            'password-confirmation': null;
            phone: string;
            flags: { is_viewing_subscriptions: number };
            'reg-from-landing': boolean;
            specializations: unknown[];
            'private-lessons': boolean;
            'time-zone': string;
            lang: string;
            'lesson-duration': number;
            'is-password-gen': boolean;
            'teach-languages': string[];
            'native-languages': string[];
            'speak-languages': string[];
            subjects: string[];
            'tutor-locales': string[];
            accents: string[];
            'give-homework': boolean;
            'use-old-price': boolean;
            'reg-from': number;
            partner: boolean;
            'is-chat2desk-client-id': boolean;
            'is-renew-student': boolean;
            tags: unknown[];
            'is-subscription': boolean;
            'is-unlimited-subscription': boolean;
            'additional-courses': unknown[];
            'is-adult': boolean;
            'is-teach-adults': boolean;
            'is-tutor-accredited': boolean;
            'use-separated-balances': boolean;
            'returned-student': boolean;
            'from-permanent-schedule': boolean;
            'is-email-confirmed': boolean;
            'is-invalid-email': boolean;
            'is-pin-to-video-server': boolean;
            'origin-lang': string;
            'learn-subjects': unknown[];
            'is-phone-confirmed': boolean;
            utm_source: {
                src: string;
                utm_funnel: string;
            };
            experiments: Array<{
                alias: string;
                variant: string;
            }>;
            ga_client_id: string;
            fb_client_id: string;
            'is-deleted': boolean;
        };
        relationships: {
            'user-metum': {
                data: {
                    type: 'user-meta';
                    attributes: {
                        [key: string]: unknown;
                        'is-native-lang': boolean;
                        'child-name': string;
                        'child-age': number;
                        qualifications: unknown[];
                        'funnel-data': Record<string, string | number>;
                        'is-loyal': boolean;
                        'can-reschedule': boolean;
                        'can-save-min-working-hours': boolean;
                        'upsell-fifty-five-banner': boolean;
                        'upsell-fifty-five-modal': boolean;
                        __id__: string;
                    };
                };
            };
        };
    };
}

export interface JsonApiUserResourceDto {
    type: 'users';
    id: string;
    attributes: {
        name: string;
        email: string | null;
        phone: string;
        [key: string]: unknown;
    };
    relationships?: {
        'user-metum'?: {
            data?: {
                type: 'user-meta';
                id: string;
                attributes?: Record<string, unknown>;
            };
        };
    };
}

export interface CreateUserResponseDto {
    data: JsonApiUserResourceDto;
    included?: Array<{
        type: string;
        id: string;
        attributes?: Record<string, unknown>;
    }>;
}

export interface OAuthTokenDto {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user_id: number;
    token_type: string;
}
