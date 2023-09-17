/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('OreDigital incident reporting API')
    .setDescription('Reduce the risk and improve productivity')
    .setVersion('1.0')
    .addTag('oreDigital')
    .addBearerAuth({
      description: `[just text field] Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer', 
      scheme: 'Bearer',
      type: 'http', 
      in: 'Header'
    }, 'Authorization')
    .build();

  app.use(
    cors({
      origin: '*',
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);

  // insert the roles in the database at the application starting
}
bootstrap();
