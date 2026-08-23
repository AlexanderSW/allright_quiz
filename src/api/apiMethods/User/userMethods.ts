import { APIRequestContext } from '@playwright/test';
import { env } from '../../../config/env';
import { CreateUserRequestDto, JsonApiUserResourceDto } from '../../../data/dto/userDto';

// Public credentials sent by the stage frontend during signup. The
// registration token grants the create endpoint access to phone/email fields;
// the Basic credential identifies the public OAuth client.
const REGISTRATION_TOKEN =
    'de95b8213727ed378c7de91654b113d2a44bcdcab8efc16fd24d84c4935ef76b.cGhvbmUsZW1haWw=';
const FRONTEND_CLIENT_AUTHORIZATION = 'Basic ZnJvbnRlbmRDbGllbnQ6cXdlcnR5MTIz';

export class UserMethods {
    constructor(private readonly request: APIRequestContext) { }

    async createUser(body: CreateUserRequestDto) {
        return this.request.post(`${env.apiBaseUrl}/v1/users`, {
            data: body,
            headers: {
                ...jsonApiHeaders(),
                'x-registration-token': REGISTRATION_TOKEN,
            },
        });
    }

    async authenticate(username: string, password: string) {
        return this.request.post(`${env.baseUrl}/oauth/token`, {
            form: {
                grant_type: 'password',
                username,
                password,
                client_id: 'frontendClient',
            },
            headers: {
                ...pageHeaders('/uk/app/sign-up/long/charlie/user-info-phone'),
                Accept: 'application/json',
                'Accept-Language': 'en-US',
                Authorization: FRONTEND_CLIENT_AUTHORIZATION,
            },
        });
    }

    async updateEmail(
        userId: string,
        resource: JsonApiUserResourceDto,
        email: string,
        accessToken: string,
    ) {
        return this.request.patch(`${env.apiBaseUrl}/v1/users/${userId}/update-email`, {
            data: {
                data: {
                    ...resource,
                    attributes: {
                        ...resource.attributes,
                        email,
                        'new-email': email,
                    },
                },
            },
            headers: jsonApiHeaders(accessToken),
        });
    }

    async getCurrentUser(accessToken: string) {
        return this.request.get(`${env.apiBaseUrl}/v1/users`, {
            params: {
                include: 'UserDevices,UserMetum,TutorType,ChildProfiles,UserExperiments',
                me: true,
            },
            headers: jsonApiHeaders(accessToken),
        });
    }

    async updateUser(userId: string, resource: JsonApiUserResourceDto, accessToken: string) {
        return this.request.patch(`${env.apiBaseUrl}/v1/users/${userId}`, {
            data: { data: resource },
            headers: jsonApiHeaders(accessToken),
        });
    }

    async getUserByEmail(email: string) {
        return this.request.get(`${env.apiBaseUrl}/v1/users`, {
            params: { 'filter[email]': email },
            headers: jsonApiHeaders(),
        });
    }
}

function jsonApiHeaders(accessToken?: string): Record<string, string> {
    return {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Accept-Language': 'uk',
        ...pageHeaders('/uk/app/sign-up/long/charlie/user-info-phone'),
        'utm-source': registrationUtmHeader(),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
}

function pageHeaders(pagePath: string): Record<string, string> {
    const origin = String(env.baseUrl);
    return {
        Origin: origin,
        Referer: `${origin}${pagePath}`,
    };
}

function registrationUtmHeader(): string {
    return JSON.stringify({
        src: `${env.baseUrl}/uk/app/sign-up/long/personalized/age-range`,
        utm_funnel: 'sign-up.long.charlie',
    })
        .replaceAll('{', '%7B')
        .replaceAll('}', '%7D')
        .replaceAll('"', '%22');
}
