import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'
import { TireTypes } from './tire_types.entity'
import { User } from './user.entity'

@Entity('tire_type_likes')
@Unique('uq_tire_type_likes_user_tire_type', ['userId', 'tireTypeId'])
export class TireTypeLike {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ name: 'user_id', type: 'int' })
	userId: number

	@Column({ name: 'tire_type_id', type: 'int' })
	tireTypeId: number

	@ManyToOne(() => User, (user) => user.likes, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'user_id' })
	user: User

	@ManyToOne(() => TireTypes, (tireType) => tireType.likes, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'tire_type_id' })
	tireType: TireTypes
}
