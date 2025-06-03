import { Module } from '@nestjs/common';
import { EmailJobGracefulShutdownService } from './email-job-graceful-shutdown.service';
import { EmailJobGracefulShutdownController } from './email-job-graceful-shutdown.controller';

@Module({
  providers: [EmailJobGracefulShutdownService],
  controllers: [EmailJobGracefulShutdownController],
  exports: [EmailJobGracefulShutdownService],
})
export class EmailJobGracefulShutdownModule {}
