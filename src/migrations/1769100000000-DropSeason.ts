import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropSeason1769100000000 implements MigrationInterface {
	name = 'DropSeason1769100000000'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE tire_types DROP CONSTRAINT chk_tire_types_season`)
		await queryRunner.query(`ALTER TABLE tire_types DROP COLUMN season`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE tire_types ADD COLUMN season varchar(20)`)
		await queryRunner.query(
			`ALTER TABLE tire_types ADD CONSTRAINT chk_tire_types_season CHECK (season IS NULL OR season IN ('летняя', 'зимняя', 'всесезонная'))`,
		)
	}
}
