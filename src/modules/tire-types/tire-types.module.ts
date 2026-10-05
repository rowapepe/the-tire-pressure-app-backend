import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TireTypeLike } from '../../entities/tire-type-like.entity'
import { TireTypes } from '../../entities/tire-type.entity'
import { TireTypesController } from './controllers/tire-types.controller'
import { TypeORMTireTypeLikesRepository } from './repositories/typeorm-tire-type-likes.repository'
import { TypeORMTireTypesRepository } from './repositories/typeorm-tire-types.repository'
import { MinioService } from './services/minio.service'
import { TireTypesService } from './services/tire-types.service'

@Module({
	imports: [TypeOrmModule.forFeature([TireTypes, TireTypeLike])],
	controllers: [TireTypesController],
	providers: [TireTypesService, TypeORMTireTypesRepository, TypeORMTireTypeLikesRepository, MinioService],
	exports: [TireTypesService],
})
export class TireTypesModule {}
