import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Redirect, Render } from '@nestjs/common'
import { SEASONS } from './tire_types.entity'
import { type PublishTireTypeDto, TireTypesService } from './tire_types.service'

@Controller('tire_types')
export class TireTypesController {
	constructor(private readonly tireTypesService: TireTypesService) {}

	@Get()
	@Render('tile')
	async getTile(@Query('radiusMin') radiusMin?: string, @Query('radiusMax') radiusMax?: string) {
		const range = this.tireTypesService.getRadiusRange(radiusMin, radiusMax)
		return {
			title: 'Список шин',
			tireTypes: await this.tireTypesService.findAll(range.min, range.max),
			radiusMin: range.min,
			radiusMax: range.max,
			radiusLimits: this.tireTypesService.radiusLimits,
		}
	}

	@Get('add')
	@Render('add')
	async getAdd() {
		const tireType = await this.tireTypesService.findDraft()
		const seasons = SEASONS.map((name) => ({ name, checked: tireType?.season === name }))
		return { title: 'Добавление', tireType, seasons }
	}

	@Get(':id/feed')
	@Render('feed')
	async getFeed(@Param('id', ParseIntPipe) id: number) {
		const { tireType, nextId } = await this.tireTypesService.findFeedItem(id)
		return { title: tireType.title, tireType, nextId }
	}

	@Post()
	@Redirect('/tire_types/add', 303)
	async createDraft(@Body('title') title?: string) {
		await this.tireTypesService.createDraft(title)
	}

	@Post(':id/publish')
	@Redirect('/tire_types', 303)
	async publish(@Param('id', ParseIntPipe) id: number, @Body() dto: PublishTireTypeDto) {
		await this.tireTypesService.publish(id, dto)
	}

	@Post(':id/delete')
	@Redirect('/tire_types', 303)
	async delete(
		@Param('id', ParseIntPipe) id: number,
		@Body('radiusMin') radiusMin?: string,
		@Body('radiusMax') radiusMax?: string,
	) {
		await this.tireTypesService.softDelete(id)
		const range = this.tireTypesService.getRadiusRange(radiusMin, radiusMax)
		return { url: `/tire_types?radiusMin=${range.min}&radiusMax=${range.max}` }
	}
}
