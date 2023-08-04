import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cors());
  app.use(cookieParser());
  app.enableCors({
    "origin": ["https://localhost:3000", "https://localhost:3000/profile", "http://localhost:3000", "https://api.intra.42.fr/"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204,
    "credentials": true,
    "allowedHeaders": "Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Credentials"
  });
  await app.listen(5000);
  // await app.listen(3333);
}
bootstrap();
