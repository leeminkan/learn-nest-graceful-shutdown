import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EmailJobSchedulerService implements OnApplicationShutdown {
  private readonly logger = new Logger(EmailJobSchedulerService.name);

  // async beforeApplicationShutdown(signal?: string) {
  async onApplicationShutdown(signal?: string) {
    console.time('onApplicationShutdown');
    this.logger.warn(
      `Shutting down with signal: ${signal}, go to sleep for 10 seconds...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    this.logger.warn(`Sleep complete, signal: ${signal}.`);
    console.timeEnd('onApplicationShutdown');
  }

  @Cron(CronExpression.EVERY_SECOND)
  checkingCronJob() {
    this.logger.log(
      'Checking cron job if it still triggered when the application shutting down (onApplicationShutdown)...',
    );
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async longJob() {
    console.time('longJob');
    this.logger.log('Running long job every 30 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 20000));
    this.logger.log('Long job completed.');
    console.timeEnd('longJob');
  }
}

// RESULT:
// When the application is shutting down, the cron job still be triggered
// And the long job run for 30 seconds. It not wait for any currently running tasks to finish.
// That means it may stop the long job in the middle of process, causing inconsistent data, etc.
