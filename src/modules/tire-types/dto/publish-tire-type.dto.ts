import { Type } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { PRESSURE_LIMITS, RADIUS_LIMITS } from '../../../common/constants'

export class PublishTireTypeDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(100, { message: 'Название: не более 100 символов' })
	title?: string

	@IsString()
	@MinLength(1, { message: 'Описание не может быть пустым' })
	@MaxLength(500, { message: 'Описание: не более 500 символов' })
	description: string

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 1 })
	@Min(PRESSURE_LIMITS.min, { message: `Давление: от ${PRESSURE_LIMITS.min}` })
	@Max(PRESSURE_LIMITS.max, { message: `Давление: до ${PRESSURE_LIMITS.max}` })
	optimalPressure: number

	@Type(() => Number)
	@IsInt()
	@Min(RADIUS_LIMITS.min, { message: `Радиус: от ${RADIUS_LIMITS.min}` })
	@Max(RADIUS_LIMITS.max, { message: `Радиус: до ${RADIUS_LIMITS.max}` })
	radius: number
}
