import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { MovieService } from 'src/movie/movie.service';
import { RatingModel } from './rating.model';
import { SetRatingDto } from './setRating.dto';
@Injectable()
export class RatingService {
	constructor(
		@InjectModel(RatingModel)
		private readonly ratingModel: ReturnModelType<typeof RatingModel>,
		private readonly movieService: MovieService
	) {}

	async getMovieValueByUser(movieId: Types.ObjectId, userId: Types.ObjectId) {
		return this.ratingModel
			.findOne({ movieId, userId })
			.select('value')
			.exec()
			.then((data) => (data ? data.value : 0));
	}

	async averageRatingByMovie(movieId: Types.ObjectId | string) {
		const ratingsMovie: RatingModel[] = await this.ratingModel
			.aggregate()
			.match({
				movieId: new Types.ObjectId(movieId),
			})
			.exec();
		return (
			ratingsMovie.reduce((acc, item) => acc + item.value, 0) /
			ratingsMovie.length
		);
	}

	async setRating(userId: Types.ObjectId, dto: SetRatingDto) {
		const { movieId, value } = dto;
		const newRating = await this.ratingModel
			.findOneAndUpdate(
				{ movieId, userId },
				{
					userId,
					movieId,
					value,
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				}
			)
			.exec();
		const averageRating = await this.averageRatingByMovie(movieId);
		await this.movieService.updateRating(movieId, averageRating);
		return newRating;
	}
}
