import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	process.env.TZ = 'UTC'
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.use(cookieParser())

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	)

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Tire Pressure API')
		.setDescription(
			'Чтение (список и лента услуг) доступно без авторизации. Методы создателя требуют сессию: выполните POST /api/users/login, браузер сохранит куку sessionId и будет отправлять её сам.',
		)
		.setVersion('1.0')
		.addCookieAuth('sessionId')
		.build()
	const document = SwaggerModule.createDocument(app, swaggerConfig)
	delete document.paths['/api/tire_types/feed']
	SwaggerModule.setup('docs', app, document)

	await app.listen(3000)
	console.log('Application is running on: http://localhost:3000, Swagger: http://localhost:3000/docs')
}
bootstrap()
