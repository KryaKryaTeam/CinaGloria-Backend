import { Injectable } from '@nestjs/common';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { CriteriaEntity } from 'src/judging/domain/entities/Criteria.entity';
import { CriteriaSchema } from 'src/schemas/Criteria.schema';

@Injectable()
export class CriteriaMapper extends Mapper<CriteriaSchema, CriteriaEntity> {
  public toEntity(schema: CriteriaSchema): CriteriaEntity {
    return CriteriaEntity.load(schema);
  }
  public toSchema(entity: CriteriaEntity): CriteriaSchema {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      visibility: entity.visibility,
      score: entity.score,
    };
  }
}
