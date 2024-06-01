import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateGenreDto } from './dto/createGenre.dto';
import { GenreModel } from './genre.model';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel)
		private readonly genreModel: ReturnModelType<typeof GenreModel>
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

	async getCollections() {
		const genres = await this.getAll();
		const collections = genres;
		return collections;
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
