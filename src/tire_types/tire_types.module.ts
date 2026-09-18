import { Module } from '@nestjs/common'
import { TireTypesController } from './tire_types.controller'
import { TireTypesService } from './tire_types.service'

@Module({
	controllers: [TireTypesController],
	providers: [TireTypesService],
})
export class TireTypesModule {}
