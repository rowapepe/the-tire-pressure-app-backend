import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60

@Injectable()
export class MinioService implements OnModuleInit {
	private readonly logger = new Logger(MinioService.name)
	private readonly minioClient: Minio.Client
	private readonly bucketName: string

	constructor(private readonly configService: ConfigService) {
		this.bucketName = this.configService.get<string>('MINIO_BUCKET')!

		this.minioClient = new Minio.Client({
			endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
			port: Number(this.configService.get('MINIO_PORT')),
			useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
			accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
			secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
		})
	}

	async onModuleInit() {
		try {
			const exists = await this.minioClient.bucketExists(this.bucketName)
			if (!exists) {
				await this.minioClient.makeBucket(this.bucketName, 'us-east-1')
				this.logger.log(`Бакет "${this.bucketName}" создан в MinIO`)
			}
		} catch (error) {
			this.logger.error(`Ошибка при инициализации бакета MinIO: ${(error as Error).message}`)
		}
	}

	async uploadFile(fileName: string, file: Buffer, contentType: string): Promise<void> {
		await this.minioClient.putObject(this.bucketName, fileName, file, file.length, { 'Content-Type': contentType })
	}

	async getSignedUrl(fileName: string | null): Promise<string | null> {
		if (!fileName) return null

		try {
			return await this.minioClient.presignedGetObject(this.bucketName, fileName, SIGNED_URL_TTL_SECONDS)
		} catch (error) {
			this.logger.error(`Ошибка при генерации подписанной ссылки: ${(error as Error).message}`)
			return null
		}
	}

	async deleteFiles(fileNames: string[]): Promise<void> {
		const results = await Promise.allSettled(fileNames.map((name) => this.minioClient.removeObject(this.bucketName, name)))
		for (const result of results) {
			if (result.status === 'rejected') this.logger.warn(`Не удалось удалить файл из MinIO: ${result.reason}`)
		}
	}
}
