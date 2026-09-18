import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TireTypeLike } from './tire_type_like.entity'
import { TireTypes } from './tire_types.entity'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 50, unique: true })
	login: string

	@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
	createdAt: Date

	@OneToMany(() => TireTypes, (tireType) => tireType.creator)
	tireTypes: TireTypes[]

	@OneToMany(() => TireTypeLike, (like) => like.user)
	likes: TireTypeLike[]
}
