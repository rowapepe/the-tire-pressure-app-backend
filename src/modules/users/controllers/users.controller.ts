import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { SESSION_COOKIE } from '../../../common/auth-user'
import { SessionService } from '../../session/session.service'
import { LoginUserDto } from '../dto/login-user.dto'
import { RegisterUserDto } from '../dto/register-user.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { UsersService } from '../services/users.service'

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly sessionService: SessionService,
	) {}

	@Post('register')
	@ApiOperation({ summary: 'Регистрация', description: 'Создаёт пользователя. Логин уникален, пароль хранится в виде scrypt-хеша.' })
	@ApiCreatedResponse({ type: UserResponseDto })
	async register(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
		return this.usersService.register(registerUserDto)
	}

	@Post('login')
	@HttpCode(200)
	@ApiOperation({
		summary: 'Аутентификация',
		description: 'Проверяет логин и пароль, создаёт сессию в Redis и выдаёт HttpOnly-куку `sessionId`.',
	})
	@ApiOkResponse({ type: UserResponseDto, description: 'Успех, кука sessionId в заголовке Set-Cookie' })
	@ApiUnauthorizedResponse({ description: 'Неверный логин или пароль' })
	async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response): Promise<UserResponseDto> {
		const { sessionId, user } = await this.usersService.login(loginUserDto)
		res.cookie(SESSION_COOKIE, sessionId, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: this.sessionService.ttlSec * 1000,
		})
		return user
	}

	@Post('logout')
	@HttpCode(200)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Деавторизация', description: 'Удаляет сессию из Redis и очищает куку. Повторный вызов безопасен.' })
	@ApiOkResponse({ description: 'Сессия завершена' })
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		await this.usersService.logout(req.cookies?.[SESSION_COOKIE] as string | undefined)
		res.clearCookie(SESSION_COOKIE)
		return { message: 'Сессия завершена' }
	}
}
