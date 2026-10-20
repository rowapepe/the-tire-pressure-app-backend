import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export interface AuthUser {
	readonly id: number
	readonly login: string
}

export type RequestWithUser = Request & { user?: AuthUser }

export const SESSION_COOKIE = 'sessionId'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
	return ctx.switchToHttp().getRequest<RequestWithUser>().user
})
