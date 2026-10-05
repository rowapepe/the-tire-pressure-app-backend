import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { TireTypes } from '../../../entities/tire-type.entity'

@Injectable()
export class TypeORMTireTypesRepository {
	constructor(
		@InjectRepository(TireTypes)
		private readonly repository: Repository<TireTypes>,
	) {}

	private baseQuery(userId: number) {
		return this.repository
			.createQueryBuilder('t')
			.loadRelationIdAndMap('t.likeIds', 't.likes')
			.leftJoinAndMapOne('t.myLike', 't.likes', 'myLike', 'myLike.userId = :userId', { userId })
	}

	async findPublished(userId: number, radiusMin: number, radiusMax: number): Promise<TireTypes[]> {
		return await this.baseQuery(userId)
			.where('t.status = :status', { status: 'published' })
			.andWhere('t.radius BETWEEN :radiusMin AND :radiusMax', { radiusMin, radiusMax })
			.orderBy('t.id', 'ASC')
			.getMany()
	}

	async findPublishedById(id: number, userId: number): Promise<TireTypes | null> {
		return await this.baseQuery(userId)
			.where('t.id = :id AND t.status = :status', { id, status: 'published' })
			.getOne()
	}

	async findFirstPublished(userId: number): Promise<TireTypes | null> {
		return await this.baseQuery(userId)
			.where('t.status = :status', { status: 'published' })
			.orderBy('t.id', 'ASC')
			.getOne()
	}

	async findNextPublished(id: number, userId: number): Promise<TireTypes | null> {
		return await this.baseQuery(userId)
			.where('t.status = :status AND t.id > :id', { status: 'published', id })
			.orderBy('t.id', 'ASC')
			.getOne()
	}

	async findDraft(userId: number): Promise<TireTypes | null> {
		return await this.baseQuery(userId)
			.where('t.creatorId = :userId AND t.status = :status', { userId, status: 'draft' })
			.getOne()
	}

	async findOwnedNotDeleted(id: number, userId: number): Promise<TireTypes | null> {
		return await this.repository.findOne({ where: { id, creatorId: userId, status: Not('deleted') } })
	}

	async create(data: Partial<TireTypes>): Promise<TireTypes> {
		const tireType = this.repository.create(data)
		return await this.repository.save(tireType)
	}

	async save(tireType: TireTypes): Promise<TireTypes> {
		return await this.repository.save(tireType)
	}

	async markDeleted(id: number): Promise<void> {
		await this.repository.update({ id }, { status: 'deleted' })
	}
}
