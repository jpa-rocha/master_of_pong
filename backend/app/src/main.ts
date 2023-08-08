import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser'
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  var whitelist = ["https://localhost:3000", "https://api.intra.42.fr"]
  app.setGlobalPrefix('api');
  app.use(function(request: Request, response: Response, next: NextFunction){
    response.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');
    next();
  });
  app.enableCors({
    // origin: function(origin, callback) {
    //   if (whitelist.indexOf(origin) !== -1) {
    //     console.log("Allowed cors for:", origin)
    //     callback(null, true)
    //   } else {
    //     console.log("Blocked CORS for:", origin)
    //     callback(new Error('Not allowed by CORS'))
    //   }
    // },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    // preflightContinue: true,
    // allowedHeaders: "Content-Type, Accept, X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Credentials"
  });
  app.use(cookieParser());
  // app.enableCors({
  //   "origin": ["https://localhost:3000", "https://localhost:3000/profile", "http://localhost:3000", "https://api.intra.42.fr"],
  //   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  //   "preflightContinue": true,
  //   "optionsSuccessStatus": 204,
  //   "credentials": true,
  //   "allowedHeaders": "Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Credentials"
  // });
  await app.listen(5000);
  // await app.listen(3333);
}
bootstrap();
