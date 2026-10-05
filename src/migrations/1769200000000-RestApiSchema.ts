import { MigrationInterface, QueryRunner } from 'typeorm'

export class RestApiSchema1769200000000 implements MigrationInterface {
	name = 'RestApiSchema1769200000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE users ADD COLUMN password_hash varchar(255)`)

		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN image_url TO image_name`)
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN video_url TO video_name`)
		await queryRunner.query(`UPDATE tire_types SET image_name = regexp_replace(image_name, '^.*/', '') WHERE image_name IS NOT NULL`)
		await queryRunner.query(`UPDATE tire_types SET video_name = regexp_replace(video_name, '^.*/', '') WHERE video_name IS NOT NULL`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN video_name TO video_url`)
		await queryRunner.query(`ALTER TABLE tire_types RENAME COLUMN image_name TO image_url`)
		await queryRunner.query(`ALTER TABLE users DROP COLUMN password_hash`)
	}
}
