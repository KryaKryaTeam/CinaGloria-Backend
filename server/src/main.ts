import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({ type: VersioningType.URI });
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('https://bots.swedka121.com/app/', 'Public preview server')
    .addServer(
      process.env.NODE_ENV != 'PRODUCTION' ? 'http://localhost:4000/' : 'none',
      'Your local server',
    )
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  app.use('/docs', apiReference({ content: doc }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
