import {
  Injectable,
  Logger,
  OnModuleDestroy,
  BeforeApplicationShutdown,
} from '@nestjs/common';

interface EmailTask {
  id: string;
  to: string;
  subject: string;
  body: string;
  status?: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED' | 'RETRY_PENDING';
}

@Injectable()
export class EmailJobGracefulShutdownService
  implements OnModuleDestroy, BeforeApplicationShutdown
{
  private readonly logger = new Logger(EmailJobGracefulShutdownService.name);
  private isShuttingDown = false;
  private isProcessingBatch = false; // Flag to indicate if a batch is currently being worked on
  private currentBatchPromise: Promise<void> | null = null; // To await current batch completion

  // In a real app, inject your database service and email client
  // constructor(
  //   private readonly emailSender: ThirdPartyEmailService,
  //   private readonly dbService: DatabaseService,
  // ) {}

  async startEmailProcessingLoop(): Promise<void> {
    if (this.isProcessingBatch) {
      this.logger.warn(
        'Email processing is already in progress. Skipping this run.',
      );
      return;
    }

    if (this.isShuttingDown) {
      this.logger.log(
        'Shutdown initiated, not starting new email processing loop.',
      );
      return;
    }

    this.isProcessingBatch = true;
    this.logger.log('Starting a new email processing batch...');

    const processLogic = async () => {
      try {
        const emailsToSend = await this.fetchUnsentEmailsFromQueue(5); // Fetch a batch of 5

        if (this.isShuttingDown && emailsToSend.length > 0) {
          this.logger.log(
            `Shutdown initiated. Re-queueing ${emailsToSend.length} fetched emails.`,
          );
          // await this.requeueEmails(emailsToSend); // Logic to put them back for next run
          return; // Exit before processing
        }

        if (emailsToSend.length === 0) {
          this.logger.log('No emails in queue to send for this batch.');
          return;
        }

        this.logger.log(`Processing ${emailsToSend.length} emails...`);
        for (const email of emailsToSend) {
          if (this.isShuttingDown) {
            this.logger.warn(
              `Shutdown during batch. Email ${email.id} not sent. Will be re-queued or retried.`,
            );
            // await this.markEmailForRetry(email);
            // Potentially break or continue to mark remaining as retry
            break;
          }
          await this.sendAndRecordEmail(email);
        }
        this.logger.log('Finished processing email batch.');
      } catch (error) {
        this.logger.error('Error during email processing batch:', error.stack);
      } finally {
        this.isProcessingBatch = false;
        this.currentBatchPromise = null; // Clear the promise once done
      }
    };

    this.currentBatchPromise = processLogic();
    await this.currentBatchPromise; // Wait for this batch to complete

    // If not shutting down, schedule the next run (simplified polling)
    if (!this.isShuttingDown) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(() => this.startEmailProcessingLoop(), 15000); // Check again in 15 seconds
    }
  }

  // This lifecycle hook is called by NestJS when enableShutdownHooks() is used
  // and a termination signal (SIGINT, SIGTERM) is received.
  async beforeApplicationShutdown(signal?: string) {
    this.logger.warn(
      `[Graceful Shutdown] Received ${signal || 'shutdown signal'}. Preparing EmailJobGracefulShutdownService to shut down...`,
    );
    this.isShuttingDown = true;

    if (this.isProcessingBatch && this.currentBatchPromise) {
      this.logger.log(
        '[Graceful Shutdown] An email batch is currently processing. Waiting for it to complete...',
      );
      try {
        // Wait for the current ongoing batch processing to finish.
        // The loop inside startEmailProcessingLoop and processBatch will also check isShuttingDown.
        await this.currentBatchPromise;
        this.logger.log(
          '[Graceful Shutdown] Current email batch processing has finished.',
        );
      } catch (e) {
        this.logger.error(
          '[Graceful Shutdown] Error occurred while waiting for current batch to finish:',
          e.stack,
        );
      }
    } else if (this.isProcessingBatch) {
      this.logger.log(
        '[Graceful Shutdown] Processing was active but no specific batch promise to await. May have been between batches.',
      );
    } else {
      this.logger.log(
        '[Graceful Shutdown] No email batch was actively processing.',
      );
    }
    this.logger.warn(
      '[Graceful Shutdown] EmailJobGracefulShutdownService has finished its shutdown preparations.',
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onModuleDestroy() {
    // This hook is called before 'beforeApplicationShutdown'.
    // You can also put synchronous cleanup here or initiate the shutdown flag.
    this.logger.log(
      '[Graceful Shutdown] EmailJobGracefulShutdownService onModuleDestroy called.',
    );
    // Setting isShuttingDown here is also an option, but beforeApplicationShutdown
    // is often preferred for async operations that need to complete.
    // this.isShuttingDown = true;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async fetchUnsentEmailsFromQueue(
    limit: number,
  ): Promise<EmailTask[]> {
    // Simulate fetching from a database or message queue
    this.logger.debug(`Fetching up to ${limit} emails...`);
    // In a real app: await this.dbService.find({ status: 'PENDING', limit });
    // For simulation:
    if (Math.random() < 0.7 && !this.isShuttingDown) {
      // 70% chance to find emails
      return Array.from(
        { length: Math.floor(Math.random() * limit) + 1 },
        (_, i) => ({
          id: `email_${Date.now()}_${i}`,
          to: `recipient${i}@example.com`,
          subject: 'Your Daily Update',
          body: 'Hello there!',
          status: 'PENDING',
        }),
      );
    }
    return [];
  }

  private async sendAndRecordEmail(email: EmailTask): Promise<void> {
    this.logger.log(`Attempting to send email ID: ${email.id} to ${email.to}`);
    try {
      // Simulate marking as SENDING
      // await this.dbService.updateStatus(email.id, 'SENDING');

      // Simulate sending email
      // await this.emailSender.send({ to: email.to, subject: email.subject, body: email.body });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      // Simulate marking as SENT
      // await this.dbService.updateStatus(email.id, 'SENT');
      this.logger.log(`Successfully sent email ID: ${email.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email ID: ${email.id}.`, error.stack);
      // Simulate marking as FAILED
      // await this.dbService.updateStatus(email.id, 'FAILED', error.message);
    }
  }
}
