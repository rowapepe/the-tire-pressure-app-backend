import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class FeedQueryDto {
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	next?: boolean
}
