import { Type } from 'class-transformer'
import { IsIn } from 'class-validator'

export class LikeTireTypeDto {
	@Type(() => Number)
	@IsIn([0, 1], { message: 'like: 0 снимает лайк, 1 ставит лайк' })
	like: 0 | 1
}
