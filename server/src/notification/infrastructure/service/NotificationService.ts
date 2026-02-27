import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { INotificationService } from 'src/notification/application/bounds/INotificationService';
import { Notification } from 'src/notification/domain/entities/Notification';
import { BaseNotificationTarget } from '../targets/BaseNotificationTarget';

export const NotificationTarget = DiscoveryService.createDecorator();

@Injectable()
export class NotificationService implements INotificationService, OnModuleInit {
  private avalibleTargets: Map<string, BaseNotificationTarget> = new Map();

  private logger = new Logger(NotificationService.name);

  @Inject()
  private discoveryService: DiscoveryService;

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((el) => {
      const target = this.discoveryService.getMetadataByDecorator(
        NotificationTarget,
        el,
      );

      if (target == null) return;

      this.logger.log(`New notification target added: ${target as string}`);

      this.avalibleTargets.set(
        target as string,
        el.instance as BaseNotificationTarget,
      );
    });
  }
  getAvalibleTargets(): string[] {
    return Array.from(this.avalibleTargets.keys());
  }
  async sendNotification(notification: Notification): Promise<void> {
    const promises = notification.targets.map(
      async (el) => await this.avalibleTargets.get(el)?.send(notification),
    );

    await Promise.all(promises);
  }
}
