import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'src/common/application/Command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { SubmitionRepository } from 'src/common/infrastructure/repositories/SubmitionRepotisory';
import { UserRepository } from 'src/common/infrastructure/repositories/UserRepository';
import { ReposTokens } from 'src/common/Tokens';
import { Notification } from 'src/notification/domain/entities/Notification';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';
import { RoundStatus } from 'src/types/RoundStatus';

@Injectable()
export class RoundOnJudgingCommand extends Command<void, void> {
  @Inject(ReposTokens.RoundRepository)
  private readonly roundRepository: RoundRepository;

  @Inject(ReposTokens.UserRepository)
  private readonly userRepository: UserRepository;

  @Inject(ReposTokens.SubmitionRepository)
  private readonly submissionRepository: SubmitionRepository;

  async implementation(data: void): Promise<void> {
    const rounds = await this.roundRepository.findAllTimedOut();
    const juries = await this.userRepository.findAllJuries();

    rounds.forEach(async (round) => {
      const submissions = await this.submissionRepository.findByRound(round);
      submissions.forEach(async (submission, i) => {
        const jury = juries[i % juries.length];
        submission.assignedToJury = jury.id;
        await this.submissionRepository.save(submission);

        this.eventDispatcher.addEvent(
          new SendNotificationEvent(
            Notification.create({
              title: 'Hey! You got some submissions to review',
              content: `The round ${round.name} has ended. We've distributed its submissions.`,
              from: 'System',
              targets: ['ws'],
              to: { ws: jury.id },
            }),
          ),
        );
      });
      round.status = RoundStatus.ON_JUDGING;
      await this.roundRepository.save(round);
    });
  }
}
