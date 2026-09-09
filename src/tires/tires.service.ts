import { Injectable } from '@nestjs/common'
import { Tire } from './tire.model'

@Injectable()
export class TiresService {
	private readonly minioBaseUrl = 'http://localhost:9000/media/'

	private tires: Tire[] = [
		{
			id: 1,
			status: 'published',
			title: 'Michelin Pilot Sport 4',
			description: 'Летняя шина премиум-класса для спортивных автомобилей...',
			tireType: 'летняя',
			temperature: 25,
			vehicleWeight: 1800,
			surfaceCoefficient: 0.8,
			recommendedPressure: 2.3,
			imageKey: 'michelin-pilot-sport.jpg',
			videoKey: 'michelin-pilot-sport.mov',
			likes: [101, 205],
		},
		{
			id: 2,
			status: 'published',
			title: 'Nokian Hakkapeliitta 10',
			description: 'Зимняя шипованная шина для суровых условий...',
			tireType: 'зимняя',
			temperature: -15,
			vehicleWeight: 2000,
			surfaceCoefficient: 0.4,
			recommendedPressure: 2.1,
			imageKey: 'nokian-hakka.jpg',
			videoKey: 'nokian-hakka.MP4',
			likes: [101],
		},
		{
			id: 3,
			status: 'published',
			title: 'Continental AllSeasonContact',
			description: 'Всесезонная шина для смешанных условий...',
			tireType: 'всесезонная',
			temperature: 10,
			vehicleWeight: 1600,
			surfaceCoefficient: 0.6,
			recommendedPressure: 2.2,
			imageKey: 'continental-allseason.jpg',
			videoKey: 'continental-allseason.mov',
			likes: [101, 205, 304],
		},
		{
			id: 5,
			status: 'draft',
			title: 'Nokian Hakkapeliitta 10',
			description: 'Шипованная зимняя шина для экстремально низких температур...',
			tireType: 'зимняя',
			temperature: -30,
			vehicleWeight: 2200,
			surfaceCoefficient: 0.35,
			recommendedPressure: 2.1,
			imageKey: 'nokian-hakkapeliitta.jpg',
			videoKey: 'nokian-hakkapeliitta.mov',
			likes: [],
		},
		{
			id: 6,
			status: 'deleted',
			title: 'Bridgestone Turanza T005',
			description: 'Летняя комфортная шина с низким уровнем шума и хорошей управляемостью...',
			tireType: 'летняя',
			temperature: 30,
			vehicleWeight: 1900,
			surfaceCoefficient: 0.75,
			recommendedPressure: 2.3,
			imageKey: 'bridgestone-turanza.jpg',
			videoKey: 'bridgestone-turanza.mov',
			likes: [],
		},
	]

	private withMediaUrls(tire: Tire) {
		return {
			...tire,
			imageUrl: this.minioBaseUrl + tire.imageKey,
			videoUrl: this.minioBaseUrl + tire.videoKey,
			likesCount: tire.likes.length,
		}
	}

	findAll(filter?: string) {
		let list = this.tires.filter((t) => t.status === 'published')
		if (filter && filter.trim() !== '') {
			const value = Number(filter)
			if (!isNaN(value)) {
				list = list.filter((t) => t.vehicleWeight >= value)
			}
		}
		return list.map((t) => this.withMediaUrls(t))
	}

	findDraft() {
		const draft = this.tires.find((t) => t.status === 'draft')
		return draft ? this.withMediaUrls(draft) : null
	}

	findFeedItem(id: number, next?: boolean) {
		const published = this.tires.filter((t) => t.status === 'published')
		let index = published.findIndex((t) => t.id === id)
		if (index === -1) return null

		if (next) {
			index = (index + 1) % published.length
		}
		return this.withMediaUrls(published[index])
	}
}
