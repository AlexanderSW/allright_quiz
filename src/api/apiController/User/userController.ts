import { APIRequestContext } from '@playwright/test';
import { UserMethods } from '../../apiMethods/User/userMethods';
import { UserDto } from '../../../data/dto/userDto';

// Business-level API: turns raw responses into typed results tests assert on,
// independent of which A/B variant or step order produced the account.
export class UserController {
    private readonly methods: UserMethods;

    constructor(request: APIRequestContext) {
        this.methods = new UserMethods(request);
    }

    async findByEmail(email: string): Promise<UserDto> {
        const response = await this.methods.getUserByEmail(email);
        if (!response.ok()) {
            return { exists: false };
        }

        const body = await response.json();
        return { exists: Boolean(body?.id), userId: body?.id, email: body?.email };
    }
}
