// Shape of the business outcome we assert on, independent of quiz UI/A-B variant.
export interface UserDto {
    exists: boolean;
    userId?: string;
    email?: string;
}
