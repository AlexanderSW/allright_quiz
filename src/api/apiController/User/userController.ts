import { APIRequestContext, APIResponse } from '@playwright/test';
import { UserMethods } from '../../apiMethods/User/userMethods';
import {
    CreateUserResponseDto,
    JsonApiUserResourceDto,
    OAuthTokenDto,
    UserDto,
    UserRegistrationFixture,
} from '../../../data/dto/userDto';

export class UserController {
    private readonly methods: UserMethods;

    constructor(request: APIRequestContext) {
        this.methods = new UserMethods(request);
    }

    async create(registration: UserRegistrationFixture): Promise<UserDto> {
        const response = await this.methods.createUser(registration.request);
        const body = await parseResponse<CreateUserResponseDto>(response, 'create quiz user');
        const userMetaId = body.data.relationships?.['user-metum']?.data?.id
            ?? body.included?.find((resource) => resource.type === 'user-meta')?.id;

        return {
            ...mapUser(body.data),
            userMetaId,
        };
    }

    async authenticate(phone: string, password: string): Promise<OAuthTokenDto> {
        const response = await this.methods.authenticate(phone.replace(/^\+/, ''), password);
        return parseResponse<OAuthTokenDto>(response, 'authenticate quiz user');
    }

    async updateEmail(userId: string, email: string, accessToken: string): Promise<UserDto> {
        const currentResponse = await this.methods.getCurrentUser(accessToken);
        const currentBody = await parseResponse<{
            data: JsonApiUserResourceDto | JsonApiUserResourceDto[];
        }>(currentResponse, 'get quiz user before email update');
        const currentResource = Array.isArray(currentBody.data) ? currentBody.data[0] : currentBody.data;
        if (!currentResource || currentResource.id !== userId) {
            throw new Error(`Current user does not match created quiz user ${userId}`);
        }

        const response = await this.methods.updateEmail(
            userId,
            currentResource,
            email,
            accessToken,
        );
        const body = await parseResponse<CreateUserResponseDto>(response, 'update quiz user email');
        return mapUser(body.data);
    }

    async getCurrent(accessToken: string): Promise<UserDto> {
        const response = await this.methods.getCurrentUser(accessToken);
        const body = await parseResponse<{ data: JsonApiUserResourceDto | JsonApiUserResourceDto[] }>(
            response,
            'get current quiz user',
        );
        const resource = Array.isArray(body.data) ? body.data[0] : body.data;
        return resource ? mapUser(resource) : { exists: false };
    }

    async updateLessonDateWishes(
        userId: string,
        timeStart: string,
        accessToken: string,
    ): Promise<void> {
        const response = await this.methods.getCurrentUser(accessToken);
        const body = await parseResponse<{
            data: JsonApiUserResourceDto | JsonApiUserResourceDto[];
            included?: Array<{
                type: string;
                id: string;
                attributes?: Record<string, unknown>;
            }>;
        }>(response, 'get quiz user before lesson wishes update');
        const resource = Array.isArray(body.data) ? body.data[0] : body.data;
        const relation = resource?.relationships?.['user-metum']?.data;
        const includedMeta = body.included?.find((item) =>
            item.type === 'user-meta' && item.id === relation?.id,
        );
        const metaAttributes = includedMeta?.attributes ?? relation?.attributes;
        if (!resource || resource.id !== userId || !relation || !metaAttributes) {
            throw new Error(`Cannot build lesson wishes update for quiz user ${userId}`);
        }

        resource.relationships = {
            ...resource.relationships,
            'user-metum': {
                data: {
                    ...relation,
                    attributes: {
                        ...metaAttributes,
                        'lesson-date-wishes': new Date(timeStart).toISOString(),
                    },
                },
            },
        };
        // The GET resource exposes this empty value as an array, while the
        // PATCH serializer used by the frontend sends the writable field as a string.
        resource.attributes['teach-subject'] = '';

        const updateResponse = await this.methods.updateUser(userId, resource, accessToken);
        await parseResponse<CreateUserResponseDto>(updateResponse, 'update trial lesson date wishes');
    }

    async findByEmail(email: string): Promise<UserDto> {
        const response = await this.methods.getUserByEmail(email);
        if (!response.ok()) {
            return { exists: false };
        }

        const body = await response.json() as { data?: JsonApiUserResourceDto | JsonApiUserResourceDto[] };
        const resource = Array.isArray(body.data) ? body.data[0] : body.data;
        return resource ? mapUser(resource) : { exists: false };
    }
}

function mapUser(resource: JsonApiUserResourceDto): UserDto {
    return {
        exists: true,
        userId: resource.id,
        email: resource.attributes.email,
        phone: resource.attributes.phone,
        name: resource.attributes.name,
        userMetaId: resource.relationships?.['user-metum']?.data?.id,
    };
}

async function parseResponse<T>(response: APIResponse, action: string): Promise<T> {
    const text = await response.text();
    if (!response.ok()) {
        throw new Error(`Failed to ${action}: ${response.status()} ${text}`);
    }
    return JSON.parse(text) as T;
}
