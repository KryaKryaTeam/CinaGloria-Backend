import { RoundStatus } from 'src/types/RoundStatus';
import { SubmitionEntity } from '../entities/Submition.entity';

export class SubmissionService {
  static canSubmit(entity: SubmitionEntity): boolean {
    if (entity.relatedRound.status != RoundStatus.IN_PROGRESS) return false;
    return true;
  }
}
