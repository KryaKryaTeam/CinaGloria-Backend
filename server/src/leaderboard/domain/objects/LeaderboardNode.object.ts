import { ApiError, LeaderboardErrors } from 'src/error/ApiError';
import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';

export interface ILeaderboardNodeValue {
  team: TeamEntity;
  place: number;
  sumScore: number;
  scores: ScoreEntity[];
}

export class LeaderboardNode {
  private constructor(private readonly _value: ILeaderboardNodeValue) {}

  static define(value: ILeaderboardNodeValue) {
    if (value.place <= 0) ApiError.throw(LeaderboardErrors.INVALID_PLACE_VALUE);
    return new LeaderboardNode(value);
  }

  get value() {
    return this._value;
  }

  get toJSON() {
    return this._value;
  }
}
