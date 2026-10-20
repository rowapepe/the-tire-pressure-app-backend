import { MigrationInterface, QueryRunner } from 'typeorm'

export class UsersDropCreatedAtRenameUrl1769300000000 implements MigrationInterface {
	name = 'UsersDropCreatedAtRenameUrl1769300000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE users DROP COLUMN created_at`)
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN image_name TO image_url`)
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN video_name TO video_url`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN video_url TO video_name`)
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN image_url TO image_name`)
		await queryRunner.query(`ALTER TABLE users ADD COLUMN created_at timestamp NOT NULL DEFAULT now()`)
	}
}
