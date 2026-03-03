import { Notification } from 'src/notification/domain/entities/Notification';
import {
  BaseNotificationTarget,
  INotificationData,
} from './BaseNotificationTarget';
import { NotificationTarget } from '../service/NotificationService';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import juice from 'juice';
import { marked } from 'marked';
import Mailgun from 'mailgun.js';
import { Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';

@NotificationTarget('email')
export class EmailNotificationTarget extends BaseNotificationTarget {
  private readonly maingun = new Mailgun(FormData);

  @Inject()
  private readonly chacheService: Cache;

  protected async prepare(
    notification: Notification,
  ): Promise<INotificationData> {
    const isCode = notification.content.startsWith('code:');
    const templateKey = isCode ? 'mail.templateCode' : 'mail.templateContent';

    let template: string = (await this.chacheService.get(
      templateKey,
    )) as string;

    if (!template) {
      template = await fetch(
        this.configurationService.getOrThrow<string>(templateKey),
      ).then((res) => res.text());

      if (!template) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

      await this.chacheService.set(templateKey, template);
    }

    let finalHtml: string;

    if (isCode) {
      const code = notification.content.replace('code:', '').trim();
      finalHtml = template.replace('${{code}}', code);
    } else {
      const htmlFromMarkdown = await marked(notification.content);
      finalHtml = template.replace('${{content}}', htmlFromMarkdown);
    }

    const ready = juice(finalHtml, { removeStyleTags: true });

    return {
      content: ready,
      to: notification.to.email,
      title: notification.title,
    };
  }
  protected async _send(data: INotificationData): Promise<void> {
    const mail = this.maingun.client({
      key: this.configurationService.getOrThrow<string>('mail.apiKey'),
      username: 'api',
      url: 'https://api.mailgun.net',
    });

    await mail.messages.create(
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
