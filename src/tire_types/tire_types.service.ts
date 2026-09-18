import { Injectable } from '@nestjs/common'
import { TireTypes } from './tire_types.model'

@Injectable()
export class TireTypesService {
	private readonly minioBaseUrl = 'http://localhost:9000/media/'

	readonly radiusLimits = { min: 13, max: 22 }

	private tireTypes: TireTypes[] = [
		{
			id: 1,
			status: 'published',
			title: 'Michelin Pilot Sport 4',
			description:
				'Летняя шина премиум-класса для спортивных автомобилей. Отличное сцепление на сухом и мокром асфальте, точная управляемость и короткий тормозной путь на высоких скоростях.',
			season: 'летняя',
			optimalPressure: 2.3,
			radius: 18,
			imageKey: 'michelin-pilot-sport.jpg',
			videoKey: 'michelin-pilot-sport.mov',
			likes: [101, 205],
		},
		{
			id: 2,
			status: 'published',
			title: 'Nokian Hakkapeliitta 10',
			description:
				'Зимняя шипованная шина для суровых условий. Уверенно держит дорогу на льду и укатанном снегу, обеспечивает надёжное торможение и устойчивость при морозе до -40 °C.',
			season: 'зимняя',
			optimalPressure: 2.1,
			radius: 17,
			imageKey: 'nokian-hakka.jpg',
			videoKey: 'nokian-hakka.MP4',
			likes: [101],
		},
		{
			id: 3,
			status: 'published',
			title: 'Continental AllSeasonContact',
			description:
				'Всесезонная шина для смешанных условий. Подходит для эксплуатации круглый год в умеренном климате, сохраняет эластичность в прохладную погоду и не требует сезонной переобувки.',
			season: 'всесезонная',
			optimalPressure: 2.2,
			radius: 16,
			imageKey: 'continental-allseason.jpg',
			videoKey: 'continental-allseason.mov',
			likes: [101, 205, 304],
		},
		{
			id: 5,
			status: 'draft',
			title: 'Nokian Hakkapeliitta 10',
			description:
				'Шипованная зимняя шина для экстремально низких температур. Усиленный каркас и мягкая резина сохраняют сцепление со льдом и снегом даже в сильные морозы.',
			season: 'зимняя',
			optimalPressure: 2.1,
			radius: 17,
			imageKey: 'nokian-hakkapeliitta.jpg',
			videoKey: 'nokian-hakka.MP4',
			likes: [],
		},
		{
			id: 6,
			status: 'deleted',
			title: 'Bridgestone Turanza T005',
			description:
				'Летняя комфортная шина с низким уровнем шума и хорошей управляемостью. Хорошо гасит неровности дороги и снижает утомляемость водителя в дальних поездках.',
			season: 'летняя',
			optimalPressure: 2.3,
			radius: 17,
			imageKey: 'bridgestone-turanza.jpg',
			videoKey: 'bridgestone-turanza.mov',
			likes: [],
		},
	]

	private withMediaUrls(tireType: TireTypes) {
		return {
			...tireType,
			imageUrl: this.minioBaseUrl + tireType.imageKey,
			videoUrl: this.minioBaseUrl + tireType.videoKey,
			likesCount: tireType.likes.length,
		}
	}

	private parseRadius(value: string | undefined, fallback: number) {
		if (value === undefined || value.trim() === '') return fallback
		const parsed = Number(value)
		if (isNaN(parsed)) return fallback
		return Math.min(Math.max(parsed, this.radiusLimits.min), this.radiusLimits.max)
	}

	getRadiusRange(radiusMin?: string, radiusMax?: string) {
		const first = this.parseRadius(radiusMin, this.radiusLimits.min)
		const second = this.parseRadius(radiusMax, this.radiusLimits.max)
		return { min: Math.min(first, second), max: Math.max(first, second) }
	}

	findAll(radiusMin: number, radiusMax: number) {
		return this.tireTypes
			.filter((t) => t.status === 'published' && t.radius >= radiusMin && t.radius <= radiusMax)
			.map((t) => this.withMediaUrls(t))
	}

	findDraft() {
		const draft = this.tireTypes.find((t) => t.status === 'draft')
		return draft ? this.withMediaUrls(draft) : null
	}

	findFeedItem(id: number, next?: boolean) {
		const published = this.tireTypes.filter((t) => t.status === 'published')
		let index = published.findIndex((t) => t.id === id)
		if (index === -1) return null

		if (next) {
			index = (index + 1) % published.length
		}
		return this.withMediaUrls(published[index])
	}
}
