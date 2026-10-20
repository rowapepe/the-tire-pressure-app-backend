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
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
	ApiBody,
	ApiConflictResponse,
	ApiConsumes,
	ApiCreatedResponse,
	ApiCookieAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { type AuthUser, CurrentUser } from '../../../common/auth-user'
import { OptionalIdPipe } from '../../../common/optional-id.pipe'
import { OptionalSessionGuard, SessionGuard } from '../../session/session.guard'
import { CreateTireTypeDto } from '../dto/create-tire-type.dto'
import { FeedQueryDto } from '../dto/feed-query.dto'
import { LikeResponseDto } from '../dto/like-response.dto'
import { LikeTireTypeDto } from '../dto/like-tire-type.dto'
import { PublishTireTypeDto } from '../dto/publish-tire-type.dto'
import { TireTypeFiltersDto } from '../dto/tire-type-filters.dto'
import { TireTypeResponseDto } from '../dto/tire-type-response.dto'
import { type TireTypeFiles, TireTypesService } from '../services/tire-types.service'

@ApiTags('tire_types')
@Controller('tire_types')
export class TireTypesController {
	constructor(private readonly tireTypesService: TireTypesService) {}

	@Get()
	@UseGuards(OptionalSessionGuard)
	@ApiOperation({
		summary: 'Список услуг с фильтром',
		description: 'Публичный метод. Возвращает опубликованные услуги, фильтр по радиусу. С кукой дополнительно заполняет isLiked и isOwner.',
	})
	@ApiOkResponse({ type: [TireTypeResponseDto] })
	async getAllTireTypes(@Query() filters: TireTypeFiltersDto, @CurrentUser() user?: AuthUser): Promise<TireTypeResponseDto[]> {
		return this.tireTypesService.findAll(filters, user?.id ?? null)
	}

	@Get(['feed', 'feed/:id'])
	@UseGuards(OptionalSessionGuard)
	@ApiOperation({
		summary: 'Лента услуг',
		description:
			'Публичный метод. Без `id` возвращает первую опубликованную услугу. С `id` возвращает эту услугу, а при `next=true` следующую за ней, после последней — первую.',
	})
	@ApiParam({
		name: 'id',
		type: Number,
		required: false,
		description: 'ID услуги. Можно не указывать: вернётся первая опубликованная услуга',
	})
	@ApiOkResponse({ type: TireTypeResponseDto })
	@ApiNotFoundResponse({ description: 'Услуга не найдена или опубликованных услуг нет' })
	async getFeedItem(
		@Param('id', OptionalIdPipe) id: number | undefined,
		@Query() query: FeedQueryDto,
		@CurrentUser() user?: AuthUser,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.findFeedItem(id, query.next ?? false, user?.id ?? null)
	}

	@Get('draft')
	@UseGuards(SessionGuard)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Черновик текущего пользователя', description: 'Только для авторизованного создателя.' })
	@ApiOkResponse({ type: TireTypeResponseDto })
	@ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
	@ApiNotFoundResponse({ description: 'Черновик не найден' })
	async getDraft(@CurrentUser() user: AuthUser): Promise<TireTypeResponseDto> {
		return this.tireTypesService.findDraft(user.id)
	}

	@Post()
	@UseGuards(SessionGuard)
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'image', maxCount: 1 },
				{ name: 'video', maxCount: 1 },
			],
			{ storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } },
		),
	)
	@ApiCookieAuth()
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['title', 'image', 'video'],
			properties: {
				title: { type: 'string', maxLength: 100, example: 'Летние шины R17' },
				image: { type: 'string', format: 'binary', description: 'jpeg, png, webp или gif, до 5 МБ' },
				video: { type: 'string', format: 'binary', description: 'mp4, mov или webm, до 50 МБ' },
			},
		},
	})
	@ApiOperation({
		summary: 'Создание услуги-черновика',
		description:
			'Только для авторизованного создателя. Автор (creatorId) подставляется из сессии. У пользователя может быть один черновик.',
	})
	@ApiCreatedResponse({ type: TireTypeResponseDto })
	@ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
	@ApiConflictResponse({ description: 'У пользователя уже есть черновик' })
	async createTireType(
		@Body() createTireTypeDto: CreateTireTypeDto,
		@UploadedFiles() files: TireTypeFiles,
		@CurrentUser() user: AuthUser,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.create(createTireTypeDto, files, user.id)
	}

	@Put(':id/publish')
	@UseGuards(SessionGuard)
	@ApiCookieAuth()
	@ApiOperation({
		summary: 'Публикация услуги',
		description: 'Только для создателя услуги: заполняет описание, давление и радиус и переводит черновик в published.',
	})
	@ApiOkResponse({ type: TireTypeResponseDto })
	@ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
	@ApiNotFoundResponse({ description: 'Услуга не найдена или принадлежит другому пользователю' })
	@ApiConflictResponse({ description: 'Опубликовать можно только черновик' })
	async publishTireType(
		@Param('id', ParseIntPipe) id: number,
		@Body() publishTireTypeDto: PublishTireTypeDto,
		@CurrentUser() user: AuthUser,
	): Promise<TireTypeResponseDto> {
		return this.tireTypesService.publish(id, publishTireTypeDto, user.id)
	}

	@Delete(':id')
	@UseGuards(SessionGuard)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Удаление услуги', description: 'Только для создателя услуги. Услуга помечается как deleted.' })
	@ApiOkResponse({ description: 'Услуга удалена' })
	@ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
	@ApiNotFoundResponse({ description: 'Услуга не найдена или принадлежит другому пользователю' })
	async deleteTireType(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
		await this.tireTypesService.remove(id, user.id)
		return {
			message: `Услуга с ID ${id} успешно удалена`,
			status: 'success',
			timestamp: new Date().toISOString(),
		}
	}

	@Post(':id/like')
	@HttpCode(200)
	@UseGuards(SessionGuard)
	@ApiCookieAuth()
	@ApiOperation({
		summary: 'Поставить или снять лайк',
		description: 'Только для авторизованного пользователя. like=1 ставит, like=0 снимает.',
	})
	@ApiOkResponse({ type: LikeResponseDto })
	@ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
	@ApiNotFoundResponse({ description: 'Услуга не найдена' })
	async setLike(
		@Param('id', ParseIntPipe) id: number,
		@Body() likeTireTypeDto: LikeTireTypeDto,
		@CurrentUser() user: AuthUser,
	): Promise<LikeResponseDto> {
		return this.tireTypesService.setLike(id, likeTireTypeDto, user.id)
	}
}
