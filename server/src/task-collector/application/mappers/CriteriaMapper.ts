import { Injectable } from '@nestjs/common';
import { CriteriaSchema } from '../../../schemas/Criteria.schema';
import { CriteriaEntity } from 'src/judging/domain/entities/Criteria.entity';
import { Mapper } from 'src/common/infrastructure/Mapper';

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
    };
  }
}
