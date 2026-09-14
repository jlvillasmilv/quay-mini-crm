import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

/** Structure of an email job queued for background processing. */
export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  attempts?: number;
}

const EVENT_SEND_EMAIL = 'mail.send';
const MAX_ATTEMPTS = 3;
const DELAY_BETWEEN_EMAILS_MS = 500;

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private queue: EmailJob[] = [];
  private isProcessing = false;

  constructor(
    private readonly mailerService: MailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Enqueues a verification email job for background sending.
   */
  sendUserConfirmation(email: string, name: string, url: string): void {
    this.enqueueJob({
      to: email,
      subject: 'Verifica tu cuenta',
      template: 'verification',
      context: { name, url },
    });
  }

  /**
   * Enqueues a password reset email job for background sending.
   */
  sendResetPassword(email: string, name: string, url: string): void {
    this.enqueueJob({
      to: email,
      subject: 'Recuperar contraseña',
      template: 'reset-password',
      context: { name, url },
    });
  }

  /**
   * Pushes a job to the in-memory queue and emits an event to trigger processing.
   */
  private enqueueJob(job: EmailJob): void {
    this.queue.push({ ...job, attempts: job.attempts ?? 0 });
    this.logger.log(`Email queued for <${job.to}> (Template: ${job.template}). Queue length: ${this.queue.length}`);
    this.eventEmitter.emit(EVENT_SEND_EMAIL);
  }

  /**
   * Event listener that processes the email queue sequentially without blocking HTTP responses.
   */
  @OnEvent(EVENT_SEND_EMAIL)
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      job.attempts = (job.attempts ?? 0) + 1;

      try {
        await this.mailerService.sendMail({
          to: job.to,
          subject: job.subject,
          template: job.template,
          context: job.context,
        });

        this.logger.log(`Email successfully sent to <${job.to}>`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to <${job.to}> (Attempt ${job.attempts}/${MAX_ATTEMPTS}): ${(error as Error).message}`,
        );

        if (job.attempts < MAX_ATTEMPTS) {
          // Re-queue for retry
          this.queue.push(job);
        } else {
          this.logger.error(`Max retries reached for email to <${job.to}>. Job discarded.`);
        }
      }

      // Small delay between emails to prevent SMTP rate-limiting
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS));
    }

    this.isProcessing = false;
  }
}
