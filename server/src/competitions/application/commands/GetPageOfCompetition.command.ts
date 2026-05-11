import { Inject } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Query } from 'src/common/application/Query';
import { ReposTokens } from 'src/common/Tokens';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface GetPageOfCompetitionQueryInput {
  page: number;
  user: UserEntity;
}
interface GetPageOfCompetitionQueryOutput {
  competitions: CompetitionEntity[];
}

export class GetCompetitionPageQuery extends Query<
  GetPageOfCompetitionQueryInput,
  GetPageOfCompetitionQueryOutput
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;
  async implementation(
    data: GetPageOfCompetitionQueryInput,
  ): Promise<GetPageOfCompetitionQueryOutput> {
    UserAndCompetitionService.userHasAccessToSeePrivateCompetitions(data.user);

    const result = await this.competitionRepository.getPage(data.page);

    if (result.length == 0) ApiError.throw(CompetitionErrors.PAGE_NOT_FOUND);

    return { competitions: result };
  }
}
