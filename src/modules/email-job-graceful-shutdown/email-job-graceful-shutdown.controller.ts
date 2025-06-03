import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { EmailJobGracefulShutdownService } from './email-job-graceful-shutdown.service';

@Controller('email-job-graceful-shutdown')
export class EmailJobGracefulShutdownController {
  private readonly logger = new Logger(EmailJobGracefulShutdownController.name);

  constructor(
    private readonly EmailJobGracefulShutdownService: EmailJobGracefulShutdownService,
  ) {}

  @Get('trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  // eslint-disable-next-line @typescript-eslint/require-await
  async triggerEmailJobGracefulShutdown(): Promise<{ message: string }> {
    this.logger.log('Manual trigger of email job processing requested.');
    // Start the email processing loop (will skip if already running)
    this.EmailJobGracefulShutdownService.startEmailProcessingLoop();
    return { message: 'Email job processing triggered.' };
  }
}
