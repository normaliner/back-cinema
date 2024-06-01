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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { idValidationPipe } from 'src/pipes/id.validation.pipes';
import { CreateGenreDto } from './dto/createGenre.dto';
import { GenreService } from './genre.service';

@Controller('genres')
export class GenreController {
	constructor(private readonly genreService: GenreService) {}

	@Get('by-slug/:slug')
	async bySlug(@Param('slug') slug: string) {
		return this.genreService.bySlug(slug);
	}

	@Get('collections')
	async getCollections() {
		return this.genreService.getCollections();
	}
	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.genreService.getAll(searchTerm);
	}
	@Get(':id')
	@Auth('admin')
	async get(@Param('id', idValidationPipe) id: string) {
		return this.genreService.byId(id);
	}

	@UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.genreService.create();
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', idValidationPipe) id: string,
		@Body() dto: CreateGenreDto
	) {
	
		return this.genreService.update(id, dto);
	}

	@UsePipes(new ValidationPipe())
	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id', idValidationPipe) id: string) {
		return this.genreService.delete(id);
	}
}
