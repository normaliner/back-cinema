import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { RatingController } from './rating.controller';
import { RatingModel } from './rating.model';
import { RatingService } from './rating.service';
import { MovieModule } from 'src/movie/movie.module'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: RatingModel,
				schemaOptions: {
					collection: 'Rating',
				},
			},
		]),
    MovieModule
	],
	controllers: [RatingController],
	providers: [RatingService],
})
export class RatingModule {}
