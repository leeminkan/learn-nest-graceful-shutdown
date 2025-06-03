import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Assuming AppModule imports EmailJobModule
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Crucial for graceful shutdown:
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);

  // To test locally:
  // 1. Run the app.
  // 2. Trigger the email job processing by making a request.
  // 3. After a few seconds, press Ctrl+C in the terminal.
  // 4. Observe the shutdown logs.
}
bootstrap();
