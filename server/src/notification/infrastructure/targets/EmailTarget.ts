import { Notification } from 'src/notification/domain/entities/Notification';
import {
  BaseNotificationTarget,
  INotificationData,
} from './BaseNotificationTarget';
import { NotificationTarget } from '../service/NotificationService';
import { ApiError, NotificationErrors } from 'src/error/ApiError';
import juice from 'juice';
import { marked } from 'marked';
import Mailgun from 'mailgun.js';
import { Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import nodemailer from 'nodemailer';

@NotificationTarget('email')
export class EmailNotificationTarget extends BaseNotificationTarget {
  private readonly mailgun = new Mailgun(FormData);

  @Inject()
  private readonly cacheService: Cache;

  protected async prepare(
    notification: Notification,
  ): Promise<INotificationData> {
    const isCode = notification.content.startsWith('code:');
    const templateKey = isCode ? 'mail.templateCode' : 'mail.templateContent';

    let template: string = (await this.cacheService.get(templateKey)) as string;

    if (!template) {
      template = await fetch(
        this.configurationService.getOrThrow<string>(templateKey),
      ).then((res) => res.text());

      if (!template) {
        ApiError.throw(NotificationErrors.TEMPLATE_IS_UNDEFINED);
      }

      await this.cacheService.set(templateKey, template);
    }

    let finalHtml: string;

    if (isCode) {
      const code = notification.content.replace('code:', '').trim();
      finalHtml = template.replace('${{code}}', code);
    } else {
      const htmlFromMarkdown = await marked(notification.content);
      finalHtml = template.replace('${{content}}', htmlFromMarkdown);
    }

    const inlinedHtml = juice(finalHtml, { removeStyleTags: true });

    return {
      content: inlinedHtml,
      to: notification.to.email,
      title: notification.title,
      createdAt: new Date(),
      id: notification.id,
    };
  }

  protected async _send(data: INotificationData): Promise<void> {
    const useLocalSmtp =
      this.configurationService.get<string>('USE_LOCAL_SMTP') === 'true';

    if (useLocalSmtp) {
      await this.sendViaLocalSmtp(data);
      return;
    }

    await this.sendViaMailgun(data);
  }

  private async sendViaLocalSmtp(data: INotificationData): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configurationService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configurationService.getOrThrow<string>('SMTP_PORT')),
      secure: false,
    });

    await transporter.sendMail({
      from: `CinaGloria <no-reply@local.dev>`,
      to: data.to,
      subject: data.title,
      html: data.content,
    });
  }

  private async sendViaMailgun(data: INotificationData): Promise<void> {
    const client = this.mailgun.client({
      key: this.configurationService.getOrThrow<string>('mail.apiKey'),
      username: 'api',
      url: 'https://api.mailgun.net',
    });

    await client.messages.create(
      this.configurationService.getOrThrow<string>('mail.domain'),
      {
        from: `CinaGloria <no-reply@${this.configurationService.getOrThrow<string>('mail.domain')}>`,
        to: [data.to],
        html: data.content,
        subject: data.title,
      },
    );
  }
}
