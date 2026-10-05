import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../entities/user.entity'

@Injectable()
export class TypeORMUsersRepository {
	constructor(
		@InjectRepository(User)
		private readonly repository: Repository<User>,
	) {}

	async findByLogin(login: string): Promise<User | null> {
		return await this.repository.findOneBy({ login })
	}

	async create(data: Partial<User>): Promise<User> {
		const user = this.repository.create(data)
		return await this.repository.save(user)
	}
}
