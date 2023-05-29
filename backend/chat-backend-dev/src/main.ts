import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChatGateway } from "./chat/chat.gateway";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const gateway = app.get(ChatGateway);
  // app.useWebSocketAdapter(gateway);
  await app.listen(6667);
}
bootstrap();
