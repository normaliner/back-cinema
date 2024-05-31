import { IsString } from 'class-validator';

export class RefreshTokenDto {
	@IsString({ message: 'You did`t pass refresh token or it`s not a string' })
	refreshToken: string;
}
