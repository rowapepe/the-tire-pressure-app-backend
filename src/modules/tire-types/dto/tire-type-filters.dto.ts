import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { RADIUS_LIMITS } from '../../../common/constants'

export class TireTypeFiltersDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(RADIUS_LIMITS.min)
	@Max(RADIUS_LIMITS.max)
	radiusMin?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(RADIUS_LIMITS.min)
	@Max(RADIUS_LIMITS.max)
	radiusMax?: number
}
