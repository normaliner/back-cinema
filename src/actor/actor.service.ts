import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ActorDto } from './actor.dto';
import { ActorModel } from './actor.model';

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel)
		private readonly actorModel: ReturnModelType<typeof ActorModel>
	) {}
	async bySlug(slug: string) {
		const doc = await this.actorModel.findOne({ slug }).exec();
		if (!doc) throw new NotFoundException('Actor not found');
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
				],
			};
		}
		return this.actorModel
			.aggregate()
			.match(options)
			.lookup({
				from: 'Movie',
				localField: '_id',
				foreignField: 'actors',
				as: 'movies',
			})
			.addFields({
				countMovies: {
					$size: '$movies',
				},
			})
			.project({ _v: 0, updatedAt: 0, movies: 0 })
			.sort({ createdAt: -1 })
			.exec();
	}

	/* Admin place */

	async byId(_id: string) {
		const actor = await this.actorModel.findById(_id);
		if (!actor) {
			throw new NotFoundException('Actor not found');
		}
		return actor;
	}

	async create() {
		const defaultValue: ActorDto = {
			name: '',
			slug: '',
			photo: '',
		};
		const actor = await this.actorModel.create(defaultValue);
		return actor._id;
	}

	async update(_id: string, dto: ActorDto) {
		const updateDoc = await this.actorModel
			.findByIdAndUpdate(_id, dto, {
				new: true,
			})
			.exec();
		if (!updateDoc) {
			throw new NotFoundException('Actor not found');
		}
		return updateDoc;
	}

	async delete(id: string) {
		const deleteDoc = this.actorModel.findByIdAndDelete(id).exec();
		if (!deleteDoc) {
			throw new NotFoundException('Actor not found');
		}
		return deleteDoc;
	}
}
