import { ConfigService } from '@nestjs/config'
import { TypegooseModuleOptions } from 'nestjs-typegoose'
export const getMongoDbConfig = async (
	configService: ConfigService
): Promise<TypegooseModuleOptions> => {
	const uri = configService.get<string>('MONGO_URI')
	console.log('MongoDB URI:', uri) // Логирование URI для отладки
	if (!uri) {
		throw new Error('MONGO_URI is not defined in the environment variables')
	}

	return {
		uri
	}
}
