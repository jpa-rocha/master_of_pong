import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    "origin": ["https://localhost:3000", "http://localhost:3000", "https://api.intra.42.fr/"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
  });
  await app.listen(5000);
  // await app.listen(3333);
}
bootstrap();
