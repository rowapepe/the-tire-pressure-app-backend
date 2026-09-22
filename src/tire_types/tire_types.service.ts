import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Between, DataSource, Repository } from 'typeorm'
import { CURRENT_USER_ID, DEFAULT_IMAGE_URL, DEFAULT_VIDEO_URL, PRESSURE_LIMITS, RADIUS_LIMITS } from './tire_types.constants'
import { SEASONS, TireTypes } from './tire_types.entity'

export interface PublishTireTypeDto {
	title?: string
	description?: string
	season?: string
	optimalPressure?: string
	radius?: string
}

@Injectable()
export class TireTypesService {
	readonly radiusLimits = RADIUS_LIMITS

	private mediaCheckCache = new Map<string, { available: boolean; expires: number }>()

	constructor(
		@InjectRepository(TireTypes) private readonly tireTypesRepository: Repository<TireTypes>,
		@InjectDataSource() private readonly dataSource: DataSource,
	) {}

	private async availableUrl(url: string | null, fallback: string) {
		if (!url) return fallback
		if (url.startsWith('/')) return url

		const cached = this.mediaCheckCache.get(url)
		if (cached && cached.expires > Date.now()) return cached.available ? url : fallback

		let available = false
		try {
			const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(1000) })
			available = response.ok
		} catch {
			available = false
		}
		this.mediaCheckCache.set(url, { available, expires: Date.now() + 60_000 })
		return available ? url : fallback
	}

	private async withMedia(tireType: TireTypes) {
		return {
			...tireType,
			likesCount: tireType.likeIds?.length ?? 0,
			imageUrl: await this.availableUrl(tireType.imageUrl, DEFAULT_IMAGE_URL),
			videoUrl: await this.availableUrl(tireType.videoUrl, DEFAULT_VIDEO_URL),
		}
	}

	private parseRadius(value: string | undefined, fallback: number) {
		if (value === undefined || value.trim() === '') return fallback
		const parsed = Number(value)
		if (isNaN(parsed)) return fallback
		return Math.min(Math.max(parsed, RADIUS_LIMITS.min), RADIUS_LIMITS.max)
	}

	getRadiusRange(radiusMin?: string, radiusMax?: string) {
		const first = this.parseRadius(radiusMin, RADIUS_LIMITS.min)
		const second = this.parseRadius(radiusMax, RADIUS_LIMITS.max)
		return { min: Math.min(first, second), max: Math.max(first, second) }
	}

	async findAll() {
		const tireTypes = await this.tireTypesRepository
			.createQueryBuilder('t')
			.loadRelationIdAndMap('t.likeIds', 't.likes')
			.where('t.status = :status', { status: 'published' })
			.orderBy('t.id', 'ASC')
			.getMany()
		return Promise.all(tireTypes.map((t) => this.withMedia(t)))
	}

	async searchByRadius(radiusMin: number, radiusMax: number) {
		const tireTypes = await this.tireTypesRepository
			.createQueryBuilder('t')
			.loadRelationIdAndMap('t.likeIds', 't.likes')
			.where('t.status = :status', { status: 'published' })
			.andWhere({ radius: Between(radiusMin, radiusMax) })
			.orderBy('t.id', 'ASC')
			.getMany()
		return Promise.all(tireTypes.map((t) => this.withMedia(t)))
	}

	async findDraft() {
		const draft = await this.tireTypesRepository.findOneBy({ creatorId: CURRENT_USER_ID, status: 'draft' })
		return draft ? this.withMedia(draft) : null
	}

	async findFeedItem(id: number) {
		const tireType = await this.tireTypesRepository
			.createQueryBuilder('t')
			.loadRelationIdAndMap('t.likeIds', 't.likes')
			.where('t.id = :id AND t.status = :status', { id, status: 'published' })
			.getOne()
		if (!tireType) throw new NotFoundException()

		const next =
			(await this.tireTypesRepository
				.createQueryBuilder('t')
				.where('t.status = :status AND t.id > :id', { status: 'published', id })
				.orderBy('t.id', 'ASC')
				.getOne()) ??
			(await this.tireTypesRepository
				.createQueryBuilder('t')
				.where('t.status = :status', { status: 'published' })
				.orderBy('t.id', 'ASC')
				.getOne())

		return { tireType: await this.withMedia(tireType), nextId: next?.id ?? tireType.id }
	}

	async createDraft(title?: string) {
		const value = (title ?? '').trim()
		if (value === '' || value.length > 100) throw new BadRequestException('Название: от 1 до 100 символов')

		const existing = await this.tireTypesRepository.findOneBy({ creatorId: CURRENT_USER_ID, status: 'draft' })
		if (existing) return existing

		return this.tireTypesRepository.save(this.tireTypesRepository.create({ title: value, status: 'draft', creatorId: CURRENT_USER_ID }))
	}

	async publish(id: number, dto: PublishTireTypeDto) {
		const draft = await this.tireTypesRepository.findOneBy({ id, creatorId: CURRENT_USER_ID, status: 'draft' })
		if (!draft) throw new NotFoundException()

		const title = (dto.title ?? '').trim()
		const description = (dto.description ?? '').trim()
		const pressure = Number((dto.optimalPressure ?? '').replace(',', '.'))
		const radius = Number(dto.radius)

		if (title === '' || title.length > 100) throw new BadRequestException('Название: от 1 до 100 символов')
		if (description === '' || description.length > 500) throw new BadRequestException('Описание: от 1 до 500 символов')
		if (!SEASONS.includes(dto.season as (typeof SEASONS)[number])) throw new BadRequestException('Неизвестный тип шины')
		if (isNaN(pressure) || pressure < PRESSURE_LIMITS.min || pressure > PRESSURE_LIMITS.max) {
			throw new BadRequestException(`Давление: от ${PRESSURE_LIMITS.min} до ${PRESSURE_LIMITS.max}`)
		}
		if (!Number.isInteger(radius) || radius < RADIUS_LIMITS.min || radius > RADIUS_LIMITS.max) {
			throw new BadRequestException(`Радиус: от ${RADIUS_LIMITS.min} до ${RADIUS_LIMITS.max}`)
		}

		draft.title = title
		draft.description = description
		draft.season = dto.season as TireTypes['season']
		draft.optimalPressure = Math.round(pressure * 10) / 10
		draft.radius = radius
		draft.status = 'published'
		draft.formedAt = new Date()
		return this.tireTypesRepository.save(draft)
	}

	async softDelete(id: number) {
		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.connect()
		await queryRunner.startTransaction()
		try {
			await queryRunner.query(
				`DECLARE tire_type_cursor CURSOR FOR SELECT id FROM tire_types WHERE id = $1 AND status = 'published' FOR UPDATE`,
				[id],
			)
			const rows = await queryRunner.query(`FETCH tire_type_cursor`)
			if (rows.length === 0) throw new NotFoundException()
			await queryRunner.query(`UPDATE tire_types SET status = 'deleted' WHERE CURRENT OF tire_type_cursor`)
			await queryRunner.query(`CLOSE tire_type_cursor`)
			await queryRunner.commitTransaction()
		} catch (e) {
			await queryRunner.rollbackTransaction()
			throw e
		} finally {
			await queryRunner.release()
		}
	}
}
