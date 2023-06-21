import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3333);
}
bootstrap();
