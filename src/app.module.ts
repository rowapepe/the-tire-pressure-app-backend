import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseOptions } from './database/database.options'
import { TireTypesModule } from './tire_types/tire_types.module'

@Module({
	imports: [TypeOrmModule.forRoot({ ...databaseOptions, migrationsRun: true }), TireTypesModule],
})
export class AppModule {}
