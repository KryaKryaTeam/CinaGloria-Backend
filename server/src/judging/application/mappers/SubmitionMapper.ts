import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { SubmitionSchema } from 'src/schemas/Submition.schema';

@Injectable()
export class SubmitionMapper extends Mapper<SubmitionSchema, SubmitionEntity> {
  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  public toEntity(schema: SubmitionSchema): SubmitionEntity {
    return SubmitionEntity.load({
      id: schema.id,
      githubURL: schema.githubURL,
      youtubeURL: schema.youtubeURL,
      relatedRound: this.roundMapper.toEntity(schema.relatedRound),
      assignedToJury: schema.assignedToJury ?? undefined,
      createdAt: schema.createdAt,
    });
  }

  public toSchema(entity: SubmitionEntity): SubmitionSchema {
    const sch = new SubmitionSchema();

    sch.id = entity.id;
    sch.assignedToJury = entity.assignedToJury;
    sch.githubURL = entity.githubURL;
    sch.youtubeURL = entity.youtubeURL;
    sch.relatedRound = this.roundMapper.toSchema(entity.relatedRound);
    sch.createdAt = entity.createdAt;

    return sch;
  }
}
