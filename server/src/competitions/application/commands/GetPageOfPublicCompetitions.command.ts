import { Inject } from '@nestjs/common';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { ICompetitionInList } from 'src/competitions/domain/entities/Competition.entity';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface GetPageOfPublicCompetitionsQueryInput {
  page: number;
}
interface GetPageOfPublicCompetitionsQueryOutput {
  competitions: ICompetitionInList[];
}

export class GetPublicCompetitionsPageQuery extends Query<
  GetPageOfPublicCompetitionsQueryInput,
  GetPageOfPublicCompetitionsQueryOutput
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  async implementation(
    data: GetPageOfPublicCompetitionsQueryInput,
  ): Promise<GetPageOfPublicCompetitionsQueryOutput> {
    const result = await this.competitionRepository.getPage(data.page);

    if (result.length == 0) ApiError.throw(CompetitionErrors.PAGE_NOT_FOUND);

    const filtred = result.flatMap((el) => {
      if (!el.publicInList) return [];
      return [el.publicInList];
    });

    if (filtred.length == 0) ApiError.throw(CompetitionErrors.PAGE_NOT_FOUND);

    return {
      competitions: filtred,
    };
  }
}
