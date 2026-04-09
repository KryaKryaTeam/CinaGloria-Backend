import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { ReposTokens } from 'src/common/Tokens';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { Icons } from 'src/types/Icons';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';

interface CreateRoundCommandProps {
  user: UserEntity;
  competition: {
    name: string;
    description?: string;
    hidden: boolean;
    startOfRound: Date;
    endOfRound: Date;
    icon: Icons;
    id: string;
  };
}

@Injectable()
export class CreateRoundCommand extends Command<CreateRoundCommandProps, void> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepostiory: ICompetitionRepository;

  async implementation(data: CreateRoundCommandProps) {
    const competition = await this.competitionRepostiory.findById(
      data.competition.id,
    );
    if (!competition) ApiError.throw(CompetitionErrors.UNDEFINED);

    const round = RoundAndCompetitionService.createRound(
      {
        ...data.competition,
        description: data.competition.description ?? '',
        relatedTasks: [],
      },
      competition,
    );

    competition.addRound(round);
    await this.competitionRepostiory.save(competition);
  }
}
