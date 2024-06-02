import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { idValidationPipe } from 'src/pipes/id.validation.pipes';
import { User } from './decorators/user.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserModel } from './user.model';
import { UserService } from './user.service';
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return this.userService.byId(_id);
	}
	@UsePipes(new ValidationPipe())
	@Put('profile')
	@HttpCode(200)
	@Auth()
	async updateProfile(@User('_id') _id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateProfile(_id, dto);
	}

	@Get('profile/favourites')
	@Auth()
	async getFavourites(@User('_id') _id: Types.ObjectId) {
		return this.userService.getFavouriteMovies(_id);
	}

	@Put('profile/favourites')
	@HttpCode(200)
	@Auth()
	async toogleFavourite(
		@Body('movieId', idValidationPipe) movieId: Types.ObjectId,
		@User() user: UserModel
	) {
		return this.userService.toggleFavourites(movieId, user);
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async updateUser(
		@Param('id', idValidationPipe) id: string,
		@Body() dto: UpdateUserDto
	) {
		return this.userService.updateProfile(id, dto);
	}

	@Get('count')
	@Auth('admin')
	async getCountUsers() {
		return this.userService.getCount();
	}
	@Get()
	@Auth('admin')
	async getUsers(@Query('searchTerm') searchTerm: string) {
		return this.userService.getAll(searchTerm);
	}

	@Get(':id')
	@Auth('admin')
	async getUser(@Param('id', idValidationPipe) id: string) {
		return this.userService.byId(id);
	}

	@UsePipes(new ValidationPipe())
	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async deleteUser(@Param('id', idValidationPipe) id: string) {
		return this.userService.delete(id);
	}
}
