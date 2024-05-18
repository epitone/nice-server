import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'nice',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
