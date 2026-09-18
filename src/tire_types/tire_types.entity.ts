import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TireTypeLike } from './tire_type_like.entity'
import { User } from './user.entity'

export type TireTypeStatus = 'draft' | 'published' | 'deleted'
export type TireTypeSeason = 'летняя' | 'зимняя' | 'всесезонная'

export const SEASONS: TireTypeSeason[] = ['летняя', 'зимняя', 'всесезонная']

const numericTransformer = {
	to: (value?: number | null) => value,
	from: (value?: string | null) => (value === null || value === undefined ? null : Number(value)),
}

@Entity('tire_types')
export class TireTypes {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 100 })
	title: string

	@Column({ type: 'varchar', length: 500, nullable: true })
	description: string | null

	@Column({ type: 'varchar', length: 20, default: 'draft' })
	status: TireTypeStatus

	@Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
	imageUrl: string | null

	@Column({ name: 'video_url', type: 'varchar', length: 255, nullable: true })
	videoUrl: string | null

	@Column({ type: 'varchar', length: 20, nullable: true })
	season: TireTypeSeason | null

	@Column({
		name: 'optimal_pressure',
		type: 'numeric',
		precision: 3,
		scale: 1,
		nullable: true,
		transformer: numericTransformer,
	})
	optimalPressure: number | null

	@Column({ type: 'smallint', nullable: true })
	radius: number | null

	@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
	createdAt: Date

	@Column({ name: 'formed_at', type: 'timestamp', nullable: true })
	formedAt: Date | null

	@Column({ name: 'creator_id', type: 'int' })
	creatorId: number

	@ManyToOne(() => User, (user) => user.tireTypes, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'creator_id' })
	creator: User

	@OneToMany(() => TireTypeLike, (like) => like.tireType)
	likes: TireTypeLike[]

	likeIds?: number[]
}
