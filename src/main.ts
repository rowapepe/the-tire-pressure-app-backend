import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	process.env.TZ = 'UTC'
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	)

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

	await app.listen(3000)
	console.log('Application is running on: http://localhost:3000')
}
bootstrap()
