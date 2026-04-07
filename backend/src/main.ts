import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'path';
import { AppModule } from './app.module';

loadEnv({ path: resolve(__dirname, '../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Vite dev server and other origins as needed
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
