import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseOptions } from './database/database.options'
import { TireTypesModule } from './modules/tire-types/tire-types.module'
import { UsersModule } from './modules/users/users.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres' as const,
				host: config.get<string>('DB_HOST', 'localhost'),
				port: config.get<number>('DB_PORT', 5432),
				username: config.get<string>('DB_USERNAME'),
				password: config.get<string>('DB_PASSWORD'),
				database: config.get<string>('DB_DATABASE'),
				entities: databaseOptions.entities,
				migrations: databaseOptions.migrations,
				extra: { options: '-c timezone=UTC' },
				synchronize: false,
				migrationsRun: true,
			}),
		}),
		TireTypesModule,
		UsersModule,
	],
})
export class AppModule {}
