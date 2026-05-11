import { Inject } from '@nestjs/common';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { ICompetitionOnPage } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

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
      ApiError.throw(CompetitionErrors.UNDEFINED);

    return {
      competition: result.publicOnPage,
    };
  }
}
