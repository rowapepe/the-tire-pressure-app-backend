import { Controller, Get, Param, Query, Render, NotFoundException } from '@nestjs/common'
import { TireTypesService } from './tire_types.service'

@Controller('tire_types')
export class TireTypesController {
	constructor(private readonly tireTypesService: TireTypesService) {}

	@Get()
	@Render('tile')
	getTile(@Query('radiusMin') radiusMin?: string, @Query('radiusMax') radiusMax?: string) {
		const range = this.tireTypesService.getRadiusRange(radiusMin, radiusMax)
		return {
			title: 'Список шин',
			tireTypes: this.tireTypesService.findAll(range.min, range.max),
			radiusMin: range.min,
			radiusMax: range.max,
			radiusLimits: this.tireTypesService.radiusLimits,
		}
	}

	@Get('add')
	@Render('add')
	getAdd() {
		return { title: 'Добавление', tireType: this.tireTypesService.findDraft() }
	}

	@Get(':id/feed')
	@Render('feed')
	getFeed(@Param('id') id: string, @Query('next') next?: string) {
		const tireType = this.tireTypesService.findFeedItem(Number(id), next === 'true')
		if (!tireType) throw new NotFoundException()
		return { title: tireType.title, tireType }
	}
}
