import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { RADIUS_LIMITS } from '../../../common/constants'
import { getCurrentUser } from '../../../common/current-user'
import { TireTypes } from '../../../entities/tire-type.entity'
import { CreateTireTypeDto } from '../dto/create-tire-type.dto'
import { LikeResponseDto } from '../dto/like-response.dto'
import { LikeTireTypeDto } from '../dto/like-tire-type.dto'
import { PublishTireTypeDto } from '../dto/publish-tire-type.dto'
import { TireTypeFiltersDto } from '../dto/tire-type-filters.dto'
import { TireTypeResponseDto } from '../dto/tire-type-response.dto'
import { TypeORMTireTypeLikesRepository } from '../repositories/typeorm-tire-type-likes.repository'
import { TypeORMTireTypesRepository } from '../repositories/typeorm-tire-types.repository'
import { MinioService } from './minio.service'

const IMAGE_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
}
const VIDEO_TYPES: Record<string, string> = {
	'video/mp4': 'mp4',
	'video/quicktime': 'mov',
	'video/webm': 'webm',
}
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024

export interface TireTypeFiles {
	image?: Express.Multer.File[]
	video?: Express.Multer.File[]
}

@Injectable()
export class TireTypesService {
	constructor(
		private readonly tireTypesRepository: TypeORMTireTypesRepository,
		private readonly likesRepository: TypeORMTireTypeLikesRepository,
		private readonly minioService: MinioService,
	) {}

	private async toResponse(tireType: TireTypes, userId: number): Promise<TireTypeResponseDto> {
		const [imageUrl, videoUrl] = await Promise.all([
			this.minioService.getSignedUrl(tireType.imageName),
			this.minioService.getSignedUrl(tireType.videoName),
		])

		return {
			id: tireType.id,
			title: tireType.title,
			description: tireType.description,
			status: tireType.status,
			imageUrl,
			videoUrl,
			optimalPressure: tireType.optimalPressure,
			radius: tireType.radius,
			likesCount: tireType.likeIds?.length ?? 0,
			isLiked: tireType.myLike ? 1 : 0,
			isOwner: tireType.creatorId === userId ? 1 : 0,
			createdAt: tireType.createdAt,
			formedAt: tireType.formedAt,
		}
	}

	private validateFile(file: Express.Multer.File | undefined, field: string, types: Record<string, string>, maxSize: number) {
		if (!file) throw new BadRequestException(`Файл "${field}" обязателен`)
		if (!types[file.mimetype]) {
			throw new BadRequestException(`Файл "${field}": допустимые типы — ${Object.keys(types).join(', ')}`)
		}
		if (file.size > maxSize) {
			throw new BadRequestException(`Файл "${field}": максимальный размер ${maxSize / 1024 / 1024} МБ`)
		}
		return `${field}-${randomUUID()}.${types[file.mimetype]}`
	}

	async findAll(filters: TireTypeFiltersDto): Promise<TireTypeResponseDto[]> {
		const userId = getCurrentUser().id
		const radiusMin = filters.radiusMin ?? RADIUS_LIMITS.min
		const radiusMax = filters.radiusMax ?? RADIUS_LIMITS.max
		if (radiusMin > radiusMax) throw new BadRequestException('radiusMin не может быть больше radiusMax')

		const tireTypes = await this.tireTypesRepository.findPublished(userId, radiusMin, radiusMax)
		return await Promise.all(tireTypes.map((tireType) => this.toResponse(tireType, userId)))
	}

	async findFirstFeedItem(): Promise<TireTypeResponseDto> {
		const userId = getCurrentUser().id
		const tireType = await this.tireTypesRepository.findFirstPublished(userId)
		if (!tireType) throw new NotFoundException('Опубликованных услуг пока нет')

		return await this.toResponse(tireType, userId)
	}

	async findFeedItem(id: number, next: boolean): Promise<TireTypeResponseDto> {
		const userId = getCurrentUser().id
		const current = await this.tireTypesRepository.findPublishedById(id, userId)
		if (!current) throw new NotFoundException(`Услуга с ID ${id} не найдена`)
		if (!next) return await this.toResponse(current, userId)

		const nextItem =
			(await this.tireTypesRepository.findNextPublished(id, userId)) ??
			(await this.tireTypesRepository.findFirstPublished(userId)) ??
			current
		return await this.toResponse(nextItem, userId)
	}

	async findDraft(): Promise<TireTypeResponseDto> {
		const userId = getCurrentUser().id
		const draft = await this.tireTypesRepository.findDraft(userId)
		if (!draft) throw new NotFoundException('Черновик не найден')

		return await this.toResponse(draft, userId)
	}

	async create(dto: CreateTireTypeDto, files: TireTypeFiles): Promise<TireTypeResponseDto> {
		const userId = getCurrentUser().id
		const image = files.image?.[0]
		const video = files.video?.[0]
		const imageName = this.validateFile(image, 'image', IMAGE_TYPES, MAX_IMAGE_SIZE)
		const videoName = this.validateFile(video, 'video', VIDEO_TYPES, MAX_VIDEO_SIZE)

		if (await this.tireTypesRepository.findDraft(userId)) {
			throw new ConflictException('У пользователя уже есть черновик')
		}

		try {
			await this.minioService.uploadFile(imageName, image!.buffer, image!.mimetype)
			await this.minioService.uploadFile(videoName, video!.buffer, video!.mimetype)

			const created = await this.tireTypesRepository.create({
				title: dto.title.trim(),
				status: 'draft',
				imageName,
				videoName,
				creatorId: userId,
			})
			return await this.toResponse(created, userId)
		} catch (error) {
			await this.minioService.deleteFiles([imageName, videoName])
			if ((error as { code?: string }).code === '23505') {
				throw new ConflictException('У пользователя уже есть черновик')
			}
			throw error
		}
	}

	async publish(id: number, dto: PublishTireTypeDto): Promise<TireTypeResponseDto> {
		const userId = getCurrentUser().id
		const tireType = await this.tireTypesRepository.findOwnedNotDeleted(id, userId)
		if (!tireType) throw new NotFoundException(`Услуга с ID ${id} не найдена`)
		if (tireType.status !== 'draft') throw new ConflictException('Опубликовать можно только черновик')

		tireType.title = dto.title?.trim() || tireType.title
		tireType.description = dto.description.trim()
		tireType.optimalPressure = dto.optimalPressure
		tireType.radius = dto.radius
		tireType.status = 'published'
		tireType.formedAt = new Date()

		const saved = await this.tireTypesRepository.save(tireType)
		return await this.toResponse(saved, userId)
	}

	async remove(id: number): Promise<void> {
		const userId = getCurrentUser().id
		const tireType = await this.tireTypesRepository.findOwnedNotDeleted(id, userId)
		if (!tireType) throw new NotFoundException(`Услуга с ID ${id} не найдена`)

		await this.tireTypesRepository.markDeleted(id)
	}

	async setLike(id: number, dto: LikeTireTypeDto): Promise<LikeResponseDto> {
		const userId = getCurrentUser().id
		const tireType = await this.tireTypesRepository.findPublishedById(id, userId)
		if (!tireType) throw new NotFoundException(`Услуга с ID ${id} не найдена`)

		if (dto.like === 1) {
			await this.likesRepository.add(userId, id)
		} else {
			await this.likesRepository.remove(userId, id)
		}

		return { likesCount: await this.likesRepository.count(id), isLiked: dto.like }
	}
}
