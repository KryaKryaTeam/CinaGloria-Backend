import { Mapper } from 'src/common/infrastructure/Mapper';
import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationSchema } from 'src/schemas/Notification.schema';

export class NotificationMapper extends Mapper<
  NotificationSchema,
  Notification
> {
  public toEntity(schema: NotificationSchema): Notification {
    return Notification.load({
      id: schema.id,
      content: schema.content,
      from: schema.from,
      status: schema.status,
      title: schema.title,
      to: { ws: schema.toId, email: schema.toEmail },
      targets: [],
      createdAt: schema.createdAt,
    });
  }
  public toSchema(entity: Notification): NotificationSchema {
    const schema = new NotificationSchema();
    schema.id = entity.id;
    schema.content = entity.content;
    schema.createdAt = entity.createdAt;
    schema.from = entity.from;
    schema.toId = entity.to.ws;
    schema.toEmail = entity.to.email;
    schema.title = entity.title;
    schema.status = entity.status;

    return schema;
  }
}
