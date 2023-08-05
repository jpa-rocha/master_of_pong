import { User } from "../entities/user.entity";

export class CreateFriendDto {
    isFriend: boolean;
    user: User;
    friend: User;
}