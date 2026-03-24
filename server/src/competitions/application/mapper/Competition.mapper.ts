import { Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionSchema } from 'src/schemas/Competition.schema';
import { RelationSlots } from 'src/types/RelationSlots';

@Injectable()
export class CompetitionMapper extends Mapper<
  CompetitionSchema,
  CompetitionEntity
> {
  public toEntity(schema: CompetitionSchema): CompetitionEntity {
    return CompetitionEntity.load({
      id: schema.id,
      avatar: schema.avatar
        ? InternalFile.define<typeof RelationSlots.competition.avatar>(
            schema.avatar,
            'competition:avatar',
            'competition:avatar',
          )
        : null,
      banner: schema.banner
        ? InternalFile.define<typeof RelationSlots.competition.banner>(
            schema.banner,
            'competition:banner',
            'competition:banner',
          )
        : null,
      dateOfEnd: schema.dateOfEnd,
      dateOfEndRegistration: schema.dateOfEndRegistration,
      dateOfStart: schema.dateOfStart,
      dateOfStartRegistration: schema.dateOfStartRegistration,
      description: schema.description,
      name: schema.name,
      rules: schema.rules.map((el) =>
        CompetitionRule.define(el.name, el.description, el.icon),
      ),
      socialMedia: schema.socialMedia
        ? InternalFile.define<typeof RelationSlots.competition.socialMedia>(
            schema.socialMedia,
            'competition:socialMedia',
            'competition:socialMedia',
          )
        : null,
      status: schema.status,
      publishAt: schema.publishAt,
      ultraWideBanner: schema.ultraWideBanner
        ? InternalFile.define<typeof RelationSlots.competition.ultraWideBanner>(
            schema.ultraWideBanner,
            'competition:ultraWideBanner',
            'competition:ultraWideBanner',
          )
        : null,
    });
  }
  public toSchema(entity: CompetitionEntity): CompetitionSchema {
    const schema = new CompetitionSchema();

    schema.id = entity.id;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.dateOfStart = entity.dateOfStart;
    schema.dateOfStartRegistration = entity.dateOfStartRegistration;
    schema.dateOfEnd = entity.dateOfEnd;
    schema.dateOfEndRegistration = entity.dateOfEndRegistration;
    schema.banner =
      typeof entity.banner?.value === 'undefined' ? null : entity.banner.value;
    schema.ultraWideBanner =
      typeof entity.ultraWideBanner?.value === 'undefined'
        ? null
        : entity.ultraWideBanner.value;
    schema.avatar =
      typeof entity.avatar?.value === 'undefined' ? null : entity.avatar.value;
    schema.socialMedia =
      typeof entity.socialMedia?.value === 'undefined'
        ? null
        : entity.socialMedia.value;
    schema.status = entity.status;
    schema.publishAt = entity.publishAt;
    schema.rules = entity.rules.map((el) => el.toJSON);

    return schema;
  }
}
