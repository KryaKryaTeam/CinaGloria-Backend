import { Inject } from '@nestjs/common';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { Notification } from 'src/notification/domain/entities/Notification';
import { NotificationSchema } from 'src/schemas/Notification.schema';

export class NotificationMapper extends Mapper<
  NotificationSchema,
  Notification
> {
  @Inject(MapperTokens.UserMapper)
  private userMapper: UserMapper;

  public toEntity(schema: NotificationSchema): Notification {
    return Notification.load({
      id: schema.id,
      content: schema.content,
      from: schema.from,
      status: schema.status,
      title: schema.title,
      to: this.userMapper.toEntity(schema.to),
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
    schema.to = this.userMapper.toSchema(entity.to);
    schema.title = entity.title;
    schema.status = entity.status;

    return schema;
  }
}
