import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TireTypeLike } from '../../../entities/tire-type-like.entity'

@Injectable()
export class TypeORMTireTypeLikesRepository {
	constructor(
		@InjectRepository(TireTypeLike)
		private readonly repository: Repository<TireTypeLike>,
	) {}

	async add(userId: number, tireTypeId: number): Promise<void> {
		await this.repository
			.createQueryBuilder()
			.insert()
			.into(TireTypeLike)
			.values({ userId, tireTypeId })
			.orIgnore()
			.execute()
	}

	async remove(userId: number, tireTypeId: number): Promise<void> {
		await this.repository.delete({ userId, tireTypeId })
	}

	async count(tireTypeId: number): Promise<number> {
		return await this.repository.countBy({ tireTypeId })
	}
}
