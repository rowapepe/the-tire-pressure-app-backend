import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TireTypeLike } from './tire_type_like.entity'
import { TireTypes } from './tire_types.entity'
import { TireTypesController } from './tire_types.controller'
import { TireTypesService } from './tire_types.service'
import { User } from './user.entity'

@Module({
	imports: [TypeOrmModule.forFeature([User, TireTypes, TireTypeLike])],
	controllers: [TireTypesController],
	providers: [TireTypesService],
})
export class TireTypesModule {}
