import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterUserDto {
	@IsString()
	@MinLength(3, { message: 'Логин: не менее 3 символов' })
	@MaxLength(50, { message: 'Логин: не более 50 символов' })
	@Matches(/^[A-Za-z0-9_.-]+$/, { message: 'Логин: только латиница, цифры и символы _ . -' })
	login: string

	@IsString()
	@MinLength(6, { message: 'Пароль: не менее 6 символов' })
	@MaxLength(72, { message: 'Пароль: не более 72 символов' })
	password: string
}
