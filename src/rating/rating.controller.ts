import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { idValidationPipe } from 'src/pipes/id.validation.pipes';
import { User } from 'src/user/decorators/user.decorator';
import { RatingService } from './rating.service';
import { SetRatingDto } from './setRating.dto';
@Controller('ratings')
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}
	@Get(':movieId')
	@Auth()
	async getMovieValueByUser(
		@Param('movieId', idValidationPipe) movieId: Types.ObjectId,
		@User('_id') _id: Types.ObjectId
	) {
		return this.ratingService.getMovieValueByUser(movieId, _id);
	}
	@UsePipes(new ValidationPipe())
	@Post('set-rating')
	@HttpCode(200)
	@Auth()
	async setRating(@User('_id') _id: Types.ObjectId, @Body() dto: SetRatingDto) {
		return this.ratingService.setRating(_id, dto);
	}
}
