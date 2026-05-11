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
    const sch = new CriteriaSchema();

    sch.id = entity.id;
    sch.name = entity.name;
    sch.description = entity.description;
    sch.icon = entity.icon;
    sch.visibility = entity.visibility;
    sch.score = entity.score;

    return sch;
  }
}
