import { Module } from '@nestjs/common';
import { EmailJobSchedulerService } from './email-job-scheduler.service';

@Module({
  providers: [EmailJobSchedulerService],
  controllers: [],
  exports: [],
})
export class EmailJobSchedulerModule {}
