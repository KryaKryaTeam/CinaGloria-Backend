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
import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';

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
    leaderboard: LeaderboardEntity,
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

    const nodes = leaderboard.nodes;

    // Teams with total score 0
    const zeroScoreNodes = nodes.filter((node) => node.sumScore === 0);

    const intendedEliminations = allTeamsCount - defaultPassCount;

    // Leaderboard is already sorted
    let viableNodes = nodes;

    // Recalculate if too many teams got eliminated naturally
    if (zeroScoreNodes.length > intendedEliminations) {
      viableNodes = nodes.filter((node) => node.sumScore > 0);

      const nextRoundsRemaining = roundsRemaining - 1;

      if (nextRoundsRemaining <= 0) {
        return viableNodes.slice(0, winnersCount).map((node) => node.team);
      }

      const newK = calculateK(
        viableNodes.length,
        winnersCount,
        nextRoundsRemaining,
      );

      const recalculatedPassCount = Math.round(viableNodes.length * newK);

      return viableNodes
        .slice(0, recalculatedPassCount)
        .map((node) => node.team);
    }

    return viableNodes.slice(0, defaultPassCount).map((node) => node.team);
  }
}
