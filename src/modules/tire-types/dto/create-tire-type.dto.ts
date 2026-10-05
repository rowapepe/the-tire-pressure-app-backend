import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateTireTypeDto {
	@IsString()
	@MinLength(1, { message: 'Название не может быть пустым' })
	@MaxLength(100, { message: 'Название: не более 100 символов' })
	title: string
}
