import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { CreateTireTypeDto } from '../dto/create-tire-type.dto'
import { FeedQueryDto } from '../dto/feed-query.dto'
import { LikeResponseDto } from '../dto/like-response.dto'
import { LikeTireTypeDto } from '../dto/like-tire-type.dto'
import { PublishTireTypeDto } from '../dto/publish-tire-type.dto'
import { TireTypeFiltersDto } from '../dto/tire-type-filters.dto'
import { TireTypeResponseDto } from '../dto/tire-type-response.dto'
import { type TireTypeFiles, TireTypesService } from '../services/tire-types.service'

@Controller('tire_types')
export class TireTypesController {
	constructor(private readonly tireTypesService: TireTypesService) {}

	@Get()
	async getAllTireTypes(@Query() filters: TireTypeFiltersDto): Promise<TireTypeResponseDto[]> {
		return this.tireTypesService.findAll(filters)
	}

	@Get('feed')
	async getFirstFeedItem(): Promise<TireTypeResponseDto> {
		return this.tireTypesService.findFirstFeedItem()
	}

	@Get('feed/:id')
	async getFeedItem(
		@Param('id', ParseIntPipe) id: number,
		@Query() query: FeedQueryDto,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.findFeedItem(id, query.next ?? false)
	}

	@Get('draft')
	async getDraft(): Promise<TireTypeResponseDto> {
		return this.tireTypesService.findDraft()
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'image', maxCount: 1 },
				{ name: 'video', maxCount: 1 },
			],
			{ storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } },
		),
	)
	async createTireType(
		@Body() createTireTypeDto: CreateTireTypeDto,
		@UploadedFiles() files: TireTypeFiles,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.create(createTireTypeDto, files)
	}

	@Put(':id/publish')
	async publishTireType(
		@Param('id', ParseIntPipe) id: number,
		@Body() publishTireTypeDto: PublishTireTypeDto,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.publish(id, publishTireTypeDto)
	}

	@Delete(':id')
	async deleteTireType(@Param('id', ParseIntPipe) id: number) {
		await this.tireTypesService.remove(id)
		return {
			message: `Услуга с ID ${id} успешно удалена`,
			status: 'success',
			timestamp: new Date().toISOString(),
		}
	}

	@Post(':id/like')
	@HttpCode(200)
	async setLike(
		@Param('id', ParseIntPipe) id: number,
		@Body() likeTireTypeDto: LikeTireTypeDto,
	): Promise<LikeResponseDto> {
		return this.tireTypesService.setLike(id, likeTireTypeDto)
	}
}
