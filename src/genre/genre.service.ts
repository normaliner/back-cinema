import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { MovieService } from 'src/movie/movie.service';
import { CreateGenreDto } from './dto/createGenre.dto';
import { ICollection } from './genre.interface';
import { GenreModel } from './genre.model';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel)
		private readonly genreModel: ReturnModelType<typeof GenreModel>,
		private readonly movieService: MovieService
	) {}

	async bySlug(slug: string) {
		const doc = await this.genreModel.findOne({ slug }).exec();
		if (!doc) throw new NotFoundException('Genre not found');
		return doc;
	}

	async getAll(searchTerm?: string) {
		let options = {};
		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			};
		}
		return this.genreModel
			.find(options)
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec();
	}
	async getCollections(): Promise<ICollection[]> {
		const genres = await this.getAll();
	
		const collections = await Promise.all(
			genres.map(async (genre) => {
				const moviesByGenre = await this.movieService.byGenres([genre._id]);
	
				const firstMovie = moviesByGenre[0];
				if (!firstMovie) {
					console.warn(`No movies found for genre ${genre.name}`);
					return null; 
				}
	
				const result: ICollection = {
					_id: String(genre._id),
					title: genre.name,
					slug: genre.slug,
					image: firstMovie.bigPoster,
				};
	
				return result;
			})
		);
	
		return collections.filter(collection => collection !== null);
	}
	

	/* Admin place */
	async byId(_id: string) {
		const genre = await this.genreModel.findById(_id);
		if (!genre) {
			throw new NotFoundException('Genre not found');
		}
		return genre;
	}

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		};
		const genre = await this.genreModel.create(defaultValue);
		return genre._id;
	}

	async update(_id: string, dto: CreateGenreDto) {
		const updateDoc = await this.genreModel
			.findByIdAndUpdate(_id, dto, {
				new: true,
			})
			.exec();
		if (!updateDoc) {
			throw new NotFoundException('Genre not found');
		}
		return updateDoc;
	}

	async delete(id: string) {
		const deleteDoc = this.genreModel.findByIdAndDelete(id).exec();
		if (!deleteDoc) {
			throw new NotFoundException('Genre not found');
		}
		return deleteDoc;
	}
}
