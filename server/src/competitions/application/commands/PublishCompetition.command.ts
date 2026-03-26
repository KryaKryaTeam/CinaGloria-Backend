import { Inject, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Command } from 'src/common/application/Command';
import { ReposTokens } from 'src/common/Tokens';
import type { ICompetitionRepository } from '../bounds/CompetitionRepository';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';

interface CommandInput {
  user: UserEntity;
  competitionId: string;
}

export class PublishCompetitonCommand extends Command<CommandInput, void> {
  @Inject(ReposTokens.CompetitionRepository)
  private readonly competitionRepository: ICompetitionRepository;

  async implementation(data: CommandInput): Promise<void> {
    const competition = await this.competitionRepository.findById(
      data.competitionId,
    );

    if (!competition)
      throw new NotFoundException('Competition with this id is unedfined!');

    UserAndCompetitionService.publishCompetiton(competition, data.user);

    await this.competitionRepository.save(competition);
  }
}
