import { TireTypeStatus } from '../../../entities/tire-type.entity'

export class TireTypeResponseDto {
	id: number
	title: string
	description: string | null
	status: TireTypeStatus
	imageUrl: string | null
	videoUrl: string | null
	optimalPressure: number | null
	radius: number | null
	likesCount: number
	isLiked: 0 | 1
	isOwner: 0 | 1
	createdAt: Date
	formedAt: Date | null
}
