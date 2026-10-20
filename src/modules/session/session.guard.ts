import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { RequestWithUser, SESSION_COOKIE } from '../../common/auth-user'
import { SessionService } from './session.service'

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(protected readonly sessionService: SessionService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<RequestWithUser>()
		const sessionId = request.cookies?.[SESSION_COOKIE] as string | undefined
		const user = sessionId ? await this.sessionService.get(sessionId) : null
		if (!user) throw new UnauthorizedException('Требуется авторизация')

		request.user = user
		return true
	}
}

@Injectable()
export class OptionalSessionGuard extends SessionGuard {
	override async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			return await super.canActivate(context)
		} catch (error) {
			if (error instanceof UnauthorizedException) return true
			throw error
		}
	}
}
