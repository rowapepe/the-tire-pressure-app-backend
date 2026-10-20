import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { SessionService } from '../../session/session.service'
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

async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
	if (!stored) return false
	const [salt, hash] = stored.split(':')
	if (!salt || !hash) return false
	const expected = Buffer.from(hash, 'hex')
	const actual = (await scryptAsync(password, salt, expected.length)) as Buffer
	return timingSafeEqual(actual, expected)
}

@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: TypeORMUsersRepository,
		private readonly sessionService: SessionService,
	) {}

	async register(dto: RegisterUserDto): Promise<UserResponseDto> {
		if (await this.usersRepository.findByLogin(dto.login)) {
			throw new ConflictException('Пользователь с таким логином уже существует')
		}

		try {
			const user = await this.usersRepository.create({
				login: dto.login,
				passwordHash: await hashPassword(dto.password),
			})
			return { id: user.id, login: user.login }
		} catch (error) {
			if ((error as { code?: string }).code === '23505') {
				throw new ConflictException('Пользователь с таким логином уже существует')
			}
			throw error
		}
	}

	async login(dto: LoginUserDto): Promise<{ sessionId: string; user: UserResponseDto }> {
		const user = await this.usersRepository.findByLogin(dto.login)
		if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
			throw new UnauthorizedException('Неверный логин или пароль')
		}

		const sessionId = await this.sessionService.create({ id: user.id, login: user.login })
		return { sessionId, user: { id: user.id, login: user.login } }
	}

	async logout(sessionId: string | undefined): Promise<void> {
		if (sessionId) await this.sessionService.destroy(sessionId)
	}
}
