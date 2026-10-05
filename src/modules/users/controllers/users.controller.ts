import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { LoginUserDto } from '../dto/login-user.dto'
import { RegisterUserDto } from '../dto/register-user.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { UsersService } from '../services/users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('register')
	async register(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
		return this.usersService.register(registerUserDto)
	}

	@Post('login')
	@HttpCode(200)
	login(@Body() loginUserDto: LoginUserDto) {
		return this.usersService.login(loginUserDto)
	}

	@Post('logout')
	@HttpCode(200)
	logout() {
		return this.usersService.logout()
	}
}
