import { Inject, Injectable } from '@nestjs/common';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

@Injectable()
export class CompetitionService {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async findRelatedCompetition(
    roundId: string,
  ): Promise<CompetitionEntity | null> {
    return await this.roundRepository.findRelatedCompetition(roundId);
  }
}
