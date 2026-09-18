import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitSchema1769000000000 implements MigrationInterface {
	name = 'InitSchema1769000000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE users (
				id serial PRIMARY KEY,
				login varchar(50) NOT NULL UNIQUE,
				created_at timestamp NOT NULL DEFAULT now()
			)
		`)

		await queryRunner.query(`
			CREATE TABLE tire_types (
				id serial PRIMARY KEY,
				title varchar(100) NOT NULL,
				description varchar(500),
				status varchar(20) NOT NULL DEFAULT 'draft',
				image_url varchar(255),
				video_url varchar(255),
				season varchar(20),
				optimal_pressure numeric(3,1),
				radius smallint,
				created_at timestamp NOT NULL DEFAULT now(),
				formed_at timestamp,
				creator_id integer NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
				CONSTRAINT chk_tire_types_status CHECK (status IN ('draft', 'published', 'deleted')),
				CONSTRAINT chk_tire_types_season CHECK (season IS NULL OR season IN ('летняя', 'зимняя', 'всесезонная'))
			)
		`)

		await queryRunner.query(`
			CREATE UNIQUE INDEX uq_tire_types_one_draft_per_user ON tire_types (creator_id) WHERE status = 'draft'
		`)

		await queryRunner.query(`
			CREATE TABLE tire_type_likes (
				id serial PRIMARY KEY,
				user_id integer NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
				tire_type_id integer NOT NULL REFERENCES tire_types (id) ON DELETE RESTRICT,
				CONSTRAINT uq_tire_type_likes_user_tire_type UNIQUE (user_id, tire_type_id)
			)
		`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE tire_type_likes`)
		await queryRunner.query(`DROP INDEX uq_tire_types_one_draft_per_user`)
		await queryRunner.query(`DROP TABLE tire_types`)
		await queryRunner.query(`DROP TABLE users`)
	}
}
