import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateGenreDto } from 'src/genre/dto/createGenre.dto';
import { idValidationPipe } from 'src/pipes/id.validation.pipes';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './createMovie.dto'
@Controller('movies')
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return this.movieService.bySlug(slug);
	}

	@Get('by-actor/:actorId')
	async byActor(@Param('actorId', idValidationPipe) actorId: Types.ObjectId) {
		return this.movieService.byActor(actorId);
	}

	@Post('by-genres')
	@HttpCode(200)
	async byGenres(@Body('genreIds') genreIds: Types.ObjectId) {
		return this.movieService.byGenres(genreIds);
	}

	@Get('most-popular')
	async getMostPopular() {
		return this.movieService.getMostPopular();
	}

	@Put('update-count-opened')
	@HttpCode(200)
	async updateCountOpened(@Body('slug') slug: string): Promise<any> {
		return this.movieService.updateCountOpened(slug);
	}

	@Get(':id')
	@Auth('admin')
	async get(@Param('id', idValidationPipe) id: string) {
		return this.movieService.byId(id);
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.movieService.getAll(searchTerm);
	}


	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.movieService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', idValidationPipe) id: string,
		@Body() dto: CreateMovieDto
	) {
		return this.movieService.update(id, dto);
	}

	@UsePipes(new ValidationPipe())
	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id', idValidationPipe) id: string) {
		return this.movieService.delete(id);
	}
}
