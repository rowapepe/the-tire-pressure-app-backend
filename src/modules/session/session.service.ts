import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes } from 'crypto'
import { Redis } from 'ioredis'
import { AuthUser } from '../../common/auth-user'

const KEY_PREFIX = 'session:'

@Injectable()
export class SessionService implements OnModuleDestroy {
	private readonly redis: Redis
	readonly ttlSec: number

	constructor(config: ConfigService) {
		this.ttlSec = config.get<number>('SESSION_TTL_SEC', 3600)
		this.redis = new Redis({
			host: config.get<string>('REDIS_HOST', 'localhost'),
			port: config.get<number>('REDIS_PORT', 6379),
		})
		this.redis.on('error', (error) => console.error('Redis session store error:', error.message))
	}

	async create(user: AuthUser): Promise<string> {
		const sessionId = randomBytes(32).toString('hex')
		await this.redis.set(KEY_PREFIX + sessionId, JSON.stringify(user), 'EX', this.ttlSec)
		return sessionId
	}

	async get(sessionId: string): Promise<AuthUser | null> {
		const raw = await this.redis.get(KEY_PREFIX + sessionId)
		return raw ? (JSON.parse(raw) as AuthUser) : null
	}

	async destroy(sessionId: string): Promise<void> {
		await this.redis.del(KEY_PREFIX + sessionId)
	}

	async onModuleDestroy() {
		await this.redis.quit()
	}
}
