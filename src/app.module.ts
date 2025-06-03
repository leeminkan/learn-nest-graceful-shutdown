import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailJobGracefulShutdownModule } from './modules/email-job-graceful-shutdown/email-job-graceful-shutdown.module';
// import { EmailJobSchedulerModule } from './modules/email-job-scheduler/email-job-scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EmailJobGracefulShutdownModule,
    // EmailJobSchedulerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
