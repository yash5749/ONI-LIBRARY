import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('REST API documentation for the Library System')
    .setVersion('1.0')
    .addBearerAuth() // JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

 


  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix('api'); // IMPORTANT

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
