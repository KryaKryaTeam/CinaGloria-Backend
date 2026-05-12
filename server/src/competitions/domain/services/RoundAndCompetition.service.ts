import { ApiError, UserErrors } from 'src/error/ApiError';
import {
  CompetitionEntity,
  ICreateCompetition,
} from '../entities/Competition.entity';
import { RoundEntity, type ICreateRound } from '../entities/Round.entity';
import { ICreateTask, TaskEntity } from '../entities/Task.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { RoundReviewEntity } from 'src/judging/domain/entities/RoundReview.entity';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

export class RoundAndCompetitionService {
  static createRound(
    round: ICreateRound,
    competition: CompetitionEntity,
    user: UserEntity,
  ) {
    if (!(user.hasRole(RoleEnum.ADMIN) || user.hasRole(RoleEnum.ORGANIZER)))
      ApiError.throw(UserErrors.NOT_ENOUGH_RIGHTS);

    const entity = RoundEntity.create(round); // validates here!
    competition.addRound(entity);
    return entity;
  }

  static createCompetition(data: ICreateCompetition) {
    return CompetitionEntity.create(data);
  }

  static createTask(data: ICreateTask) {
    return TaskEntity.create(data);
  }

  static addTaskToRound(task: TaskEntity, round: RoundEntity) {
    round.addTask(task);
  }

  static addRoundToCompetition(
    round: RoundEntity,
    competition: CompetitionEntity,
  ) {
    competition.addRound(round);
  }

  static deleteRoundFromCompetition(
    round: RoundEntity,
    competition: CompetitionEntity,
  ) {
    competition.deleteRound(round);
  }

  static countTeamsToEnterNextRound(
    finishedRound: RoundEntity,
    competition: CompetitionEntity,
    allReviews: RoundReviewEntity[],
  ): TeamEntity[] {
    const calculateK = (N: number, W: number, R: number): number => {
      if (R <= 0 || N <= 0) return 1;
      return Math.pow(W / N, 1 / R);
    };

    const allTeams = finishedRound.teams;
    const allTeamsCount = allTeams.length;

    const winnersCount = competition.settings.get('countOfWinners');
    const totalRounds = competition.rounds.length;

    const currentRoundIndex = competition.rounds.findIndex(
      (r) => r.id === finishedRound.id,
    );

    const roundsRemaining = totalRounds - currentRoundIndex;

    const K = calculateK(allTeamsCount, winnersCount, roundsRemaining);

    const defaultPassCount = Math.round(allTeamsCount * K);

    // Group reviews by team
    const teamScores = new Map<string, number>();

    for (const review of allReviews) {
      const teamId = review.submission.team.id;

      const current = teamScores.get(teamId) ?? 0;

      teamScores.set(teamId, current + review._summary);
    }

    // Teams with total score 0
    const teamsWith0Ids = [...teamScores.entries()]
      .filter(([_, score]) => score === 0)
      .map(([teamId]) => teamId);

    const intendedEliminations = allTeamsCount - defaultPassCount;

    let viableTeams = allTeams;

    // Recalculate if too many teams got eliminated naturally
    if (teamsWith0Ids.length > intendedEliminations) {
      viableTeams = allTeams.filter((team) => !teamsWith0Ids.includes(team.id));

      const nextRoundsRemaining = roundsRemaining - 1;

      if (nextRoundsRemaining <= 0) {
        return viableTeams.slice(0, winnersCount);
      }

      const newK = calculateK(
        viableTeams.length,
        winnersCount,
        nextRoundsRemaining,
      );

      const recalculatedPassCount = Math.round(viableTeams.length * newK);

      return viableTeams
        .sort((a, b) => {
          const aScore = teamScores.get(a.id) ?? 0;
          const bScore = teamScores.get(b.id) ?? 0;

          return bScore - aScore;
        })
        .slice(0, recalculatedPassCount);
    }

    return allTeams
      .sort((a, b) => {
        const aScore = teamScores.get(a.id) ?? 0;
        const bScore = teamScores.get(b.id) ?? 0;

        return bScore - aScore;
      })
      .slice(0, defaultPassCount);
  }
}
