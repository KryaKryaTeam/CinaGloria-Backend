import { Inject, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';

interface DeleteCompetitionCommandInput {
  user: UserEntity;
  competitionId: string;
}

export class DeleteCompetitionCommand extends Command<
  DeleteCompetitionCommandInput,
  void
> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  async implementation(data: DeleteCompetitionCommandInput): Promise<void> {
    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!competition)
      throw new NotFoundException('Competition with this id is unedfined!');

    UserAndCompetitionService.deleteCompetition(competition, data.user);

    await this.competitionRepository.deleteById(competition.id);
  }
}
