import { Exclude } from 'class-transformer'
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TireTypeLike } from './tire-type-like.entity'
import { TireTypes } from './tire-type.entity'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 50, unique: true })
	login: string

	@Exclude()
	@Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
	passwordHash: string | null

	@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
	createdAt: Date

	@OneToMany(() => TireTypes, (tireType) => tireType.creator)
	tireTypes: TireTypes[]

	@OneToMany(() => TireTypeLike, (like) => like.user)
	likes: TireTypeLike[]
}
