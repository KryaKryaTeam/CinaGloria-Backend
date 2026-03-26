import { Mapper } from 'src/common/infrastructure/Mapper';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { MimeType } from 'src/files/domain/objects/MimeType.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { FileSchema } from 'src/schemas/File.schema';

export class FileMapper extends Mapper<FileSchema, FileEntity> {
  public toEntity(schema: FileSchema): FileEntity {
    return FileEntity.load({
      url: schema.url,
      mimeType: new MimeType(schema.mimeType),
      size: schema.size,
      slot: RelationString.define(schema.slot),
    });
  }

  public toSchema(entity: FileEntity): FileSchema {
    const sch = new FileSchema();
    sch.url = entity.url;
    sch.size = entity.size;
    sch.mimeType = entity.mimeType.value;
    sch.slot = entity.slot.value;

    return sch;
  }
}
