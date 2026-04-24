import { ApiError, DomainErrors } from 'src/error/ApiError';

export interface ITeamHistoryPlain {
  roundId: string;
  placeInLeaderboard: number;
}

export class TeamHistoryObject {
  private readonly _roundId: string;
  private readonly _placeInLeaderboard: number;

  private constructor(plain: ITeamHistoryPlain) {
    this._placeInLeaderboard = plain.placeInLeaderboard;
    this._roundId = plain.roundId;
  }

  static define(plain: ITeamHistoryPlain) {
    if (plain.placeInLeaderboard <= 0)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    return new TeamHistoryObject(plain);
  }

  get roundId() {
    return this._roundId;
  }
  get placeInLeaderboard() {
    return this._placeInLeaderboard;
  }

  toJSON(): ITeamHistoryPlain {
    return {
      roundId: this._roundId,
      placeInLeaderboard: this._placeInLeaderboard,
    };
  }
}
