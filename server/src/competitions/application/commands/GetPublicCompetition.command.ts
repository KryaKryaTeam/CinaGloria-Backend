import { Inject, NotFoundException } from '@nestjs/common';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { ICompetitionOnPage } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';

interface GetPublicCompetitionQueryInput {
  competitionId: string;
}
interface GetPublicCompetitionQueryOutput {
  competition: ICompetitionOnPage;
}

export class GetPublicCompetitionQuery extends Query<
  GetPublicCompetitionQueryInput,
  GetPublicCompetitionQueryOutput
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  async implementation(
    data: GetPublicCompetitionQueryInput,
  ): Promise<GetPublicCompetitionQueryOutput> {
    const result = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!result || !result.publicOnPage)
      throw new NotFoundException('Competition with this id is undefined!');

    return {
      competition: result.publicOnPage,
    };
  }
}
