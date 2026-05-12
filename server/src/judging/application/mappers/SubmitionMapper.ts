import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { SubmitionSchema } from 'src/schemas/Submition.schema';
import { RoundReviewMapper } from './RoundReviewMapper';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';

@Injectable()
export class SubmitionMapper extends Mapper<SubmitionSchema, SubmitionEntity> {
  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  @Inject(forwardRef(() => RoundReviewMapper))
  private readonly roundReviewMapper: RoundReviewMapper;

  @Inject(MapperTokens.TeamMapper)
  private readonly teamMapper: TeamMapper;

  public toEntity(schema: SubmitionSchema): SubmitionEntity {
    return SubmitionEntity.load({
      id: schema.id,
      githubURL: schema.githubURL,
      youtubeURL: schema.youtubeURL,
      relatedRound: this.roundMapper.toEntity(schema.relatedRound),
      assignedToJury: schema.assignedToJury ?? undefined,
      createdAt: schema.createdAt,
      review: schema.review
        ? this.roundReviewMapper.toEntity(schema.review)
        : undefined,
      team: this.teamMapper.toEntity(schema.team),
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
    if (entity.review) {
      sch.review = this.roundReviewMapper.toSchema(entity.review);
    }
    sch.team = this.teamMapper.toSchema(entity.team);

    return sch;
  }
}
