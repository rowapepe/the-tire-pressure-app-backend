import { join } from 'path'
import { DataSourceOptions } from 'typeorm'

export const databaseOptions: DataSourceOptions = {
	type: 'postgres',
	host: process.env.DB_HOST ?? 'localhost',
	port: Number(process.env.DB_PORT ?? 5432),
	username: process.env.DB_USER ?? 'postgres',
	password: process.env.DB_PASSWORD ?? 'labs',
	database: process.env.DB_NAME ?? 'tire_types_db',
	entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
	migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
	synchronize: false,
}
