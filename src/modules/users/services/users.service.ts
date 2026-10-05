import { ConflictException, Injectable } from '@nestjs/common'
import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'
import { LoginUserDto } from '../dto/login-user.dto'
import { RegisterUserDto } from '../dto/register-user.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { TypeORMUsersRepository } from '../repositories/typeorm-users.repository'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex')
	const hash = (await scryptAsync(password, salt, 64)) as Buffer
	return `${salt}:${hash.toString('hex')}`
}

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: TypeORMUsersRepository) {}

	async register(dto: RegisterUserDto): Promise<UserResponseDto> {
		if (await this.usersRepository.findByLogin(dto.login)) {
			throw new ConflictException('Пользователь с таким логином уже существует')
		}

		try {
			const user = await this.usersRepository.create({
				login: dto.login,
				passwordHash: await hashPassword(dto.password),
			})
			return { id: user.id, login: user.login, createdAt: user.createdAt }
		} catch (error) {
			if ((error as { code?: string }).code === '23505') {
				throw new ConflictException('Пользователь с таким логином уже существует')
			}
			throw error
		}
	}

	login(_dto: LoginUserDto) {
		return { message: 'Заглушка: аутентификация будет реализована в лабораторной работе 4' }
	}

	logout() {
		return { message: 'Заглушка: деавторизация будет реализована в лабораторной работе 4' }
	}
}
