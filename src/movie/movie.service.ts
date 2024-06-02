import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateMovieDto } from './createMovie.dto';
import { MovieModel } from './movie.model';
@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel)
		private readonly movieModel: ReturnModelType<typeof MovieModel>,
		private readonly telegramService: TelegramService
	) {}

	async getAll(searchTerm?: string) {
		let options = {};
		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}
		return this.movieModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.populate('actors genres')
			.exec();
	}

	async bySlug(slug: string) {
		const docs = await this.movieModel
			.findOne({ slug })
			.populate('actors genres')
			.exec();
		if (!docs) throw new NotFoundException('Movie not found');
		return docs;
	}
	async byActor(actorId: Types.ObjectId) {
		const docs = await this.movieModel.find({ actors: actorId }).exec();
		if (!docs) throw new NotFoundException('Moviee not found');
		return docs;
	}
	async byGenres(genreIds: Types.ObjectId[]) {
		const docs = await this.movieModel
			.find({ genres: { $in: genreIds } })
			.exec();
		if (!docs) throw new NotFoundException('Movies not found');
		return docs;
	}
	async getMostPopular() {
		return this.movieModel
			.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec();
	}
	async updateCountOpened(slug: string) {
		const updateDoc = await this.movieModel
			.findOneAndUpdate({ slug }, { $inc: { countOpened: 1 } }, { new: true })
			.exec();
		if (!updateDoc) {
			throw new NotFoundException('Movie not found');
		}
		return updateDoc;
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.movieModel
			.findByIdAndUpdate(
				id,
				{
					rating: newRating,
				},
				{ new: true }
			)
			.exec();
	}
	/* Admin place */

	async byId(_id: string) {
		const movie = await this.movieModel.findById(_id);
		if (!movie) {
			throw new NotFoundException('Movie not found');
		}
		return movie;
	}

	async create() {
		const defaultValue: CreateMovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		};
		const movie = await this.movieModel.create(defaultValue);
		return movie._id;
	}

	async update(_id: string, dto: CreateMovieDto) {
		if (!dto.isSendTelegram) {
			await this.sendNotification(dto);
			dto.isSendTelegram = true;
		}
		const updateDoc = await this.movieModel
			.findByIdAndUpdate(_id, dto, {
				new: true,
			})
			.exec();
		if (!updateDoc) {
			throw new NotFoundException('Movie not found');
		}
		return updateDoc;
	}

	async delete(id: string) {
		const deleteDoc = this.movieModel.findByIdAndDelete(id).exec();
		if (!deleteDoc) {
			throw new NotFoundException('Movie not found');
		}
		return deleteDoc;
	}
	async sendNotification(dto: CreateMovieDto) {
		// if (process.env.NODE_ENV !== development) {
		// 	await this.telegramService.sendPhoto(dto.poster);
		// }
		await this.telegramService.sendPhoto(
			'https://i.pinimg.com/736x/c1/21/90/c121905b8fe555dd56985a07aac49ee8.jpg'
		);
		const msg = `<b>${dto.title}</b>\n\n`;
		await this.telegramService.sendMessage(msg, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							url: 'https://okko.tv/movie/free-guy',
							text: '🍿 Go to watch',
						},
					],
				],
			},
		});
	}
}
