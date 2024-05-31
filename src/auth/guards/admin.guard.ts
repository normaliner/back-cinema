import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<{ user: UserModel }>();
		const user = req.user;


		if (!user.isAdmin) {
			throw new ForbiddenException('You have no rights');
		}

		return user.isAdmin;
	}
}
