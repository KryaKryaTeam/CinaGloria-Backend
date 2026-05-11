import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { MapperTokens } from 'src/common/Tokens';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';
import { RoundReviewSchema } from 'src/schemas/RoundReview.schema';
import { ScoreMapper } from './ScoreMapper';
import { RoundMapper } from 'src/competitions/application/mapper/Round.mapper';
import { SubmitionMapper } from './SubmitionMapper';

@Injectable()
export class RoundReviewMapper extends Mapper<
  RoundReviewSchema,
  RoundReviewEntity
> {
  @Inject(MapperTokens.ScoreMapper)
  private readonly scoreMapper: ScoreMapper;

  @Inject(MapperTokens.RoundMapper)
  private readonly roundMapper: RoundMapper;

  @Inject(MapperTokens.SubmitionMapper)
  private readonly submissionMapper: SubmitionMapper;

  public toEntity(schema: RoundReviewSchema): RoundReviewEntity {
    const relatedScores = schema.relatedScores.map((score) =>
      this.scoreMapper.toEntity(score),
    );

    return RoundReviewEntity.load({
      id: schema.id,
      byJury: schema.byJury,
      description: schema.description,
      relatedScores,
      round: this.roundMapper.toEntity(schema.round),
      submission: this.submissionMapper.toEntity(schema.submission),
    });
  }

  public toSchema(entity: RoundReviewEntity): RoundReviewSchema {
    const sch = new RoundReviewSchema();

    sch.id = entity.id;
    sch.byJury = entity.byJury;
    sch.description = entity.description;
    sch.relatedScores = entity.relatedScores.map((score) =>
      this.scoreMapper.toSchema(score),
    );
    sch.round = this.roundMapper.toSchema(entity.round);
    sch.submission = this.submissionMapper.toSchema(entity.submission);
    sch.summary = entity.summary;

    return sch;
  }
}
