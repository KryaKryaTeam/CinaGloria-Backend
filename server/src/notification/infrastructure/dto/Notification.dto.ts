import { INotificationPlain } from 'src/notification/domain/entities/Notification';
import { NotificationStatus } from 'src/types/NotificationStatus';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto implements INotificationPlain {
  @ApiProperty({
    name: 'id',
    required: true,
    description: 'Unique identifier for the notification',
  })
  id: string;

  @ApiProperty({
    name: 'content',
    required: true,
    description: 'The main content of the notification',
  })
  content: string;

  @ApiProperty({
    name: 'createdAt',
    required: true,
    description: 'The time the notification was created',
  })
  createdAt: Date;

  @ApiProperty({
    name: 'from',
    required: true,
    description: 'The source or sender of the notification',
  })
  from: string;

  @ApiProperty({
    name: 'status',
    required: true,
    description: 'The current status of the notification',
    enum: Object.values(NotificationStatus), // Assuming NotificationStatus enum values can be used here
  })
  status: NotificationStatus;

  @ApiProperty({
    name: 'targets',
    required: true,
    description: 'A list of recipients or targets for the notification',
    type: 'array',
    items: { type: 'string' },
  })
  targets: string[];

  @ApiProperty({
    name: 'title',
    required: true,
    description: 'The title of the notification',
  })
  title: string;

  @ApiProperty({
    name: 'to',
    required: true,
    description: 'Mapping of target identifiers to recipient information',
    additionalProperties: { type: 'string' },
  })
  to: Record<string, string>;
}
