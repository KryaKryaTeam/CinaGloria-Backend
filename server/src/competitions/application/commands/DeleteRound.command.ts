import { Inject } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { ReposTokens } from 'src/common/Tokens';

interface DeleteRoundCommandProps {
  id: string;
}

export class DeleteRoundCommand extends Command<DeleteRoundCommandProps, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  async implementation(data: DeleteRoundCommandProps) {
    await this.roundRepository.delete(data.id);
  }
}
