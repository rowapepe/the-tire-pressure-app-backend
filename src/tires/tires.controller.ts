import { Controller, Get, Param, Query, Render, NotFoundException } from '@nestjs/common'
import { TiresService } from './tires.service'

@Controller()
export class TiresController {
	constructor(private readonly tiresService: TiresService) {}

	@Get('tires')
	@Render('tile')
	getTile(@Query('filter') filter?: string) {
		return { title: 'Список шин', tires: this.tiresService.findAll(filter), filter: filter || '' }
	}

	@Get('tires/add')
	@Render('add')
	getAdd() {
		return { title: 'Добавление', tire: this.tiresService.findDraft() }
	}

	@Get('tires/feed/:id')
	@Render('feed')
	getFeed(@Param('id') id: string, @Query('next') next?: string) {
		const tire = this.tiresService.findFeedItem(Number(id), next === 'true')
		if (!tire) throw new NotFoundException()
		return { title: tire.title, tire }
	}
}
