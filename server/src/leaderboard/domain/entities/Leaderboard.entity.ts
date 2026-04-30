import { Entity } from 'src/common/domain/Entity';
import { ILeaderboardNodeValue } from '../objects/LeaderboardNode.object';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { randomUUID } from 'crypto';

export interface ICreateLeaderboard {
  nodes: ILeaderboardNodeValue[];
  round: RoundEntity;
}

export interface ILeaderboardPlain {
  id: string;
  nodes: ILeaderboardNodeValue[];
  round: RoundEntity;
}

export interface ILeaderboardEntityJSON {
  id: string;
  nodes: ILeaderboardNodeValue[];
  round: RoundEntity;
}

export class LeaderboardEntity extends Entity {
  public readonly _id: string;
  public _nodes: ILeaderboardNodeValue[];
  public _round: RoundEntity;

  private constructor(data: ILeaderboardPlain) {
    super();
    this._id = data.id;
    this._nodes = data.nodes;
    this._round = data.round;
  }

  static load(data: ILeaderboardPlain) {
    return new LeaderboardEntity(data);
  }

  static create(data: ICreateLeaderboard) {
    return new LeaderboardEntity({
      id: randomUUID(),
      ...data,
    });
  }

  get id() {
    return this._id;
  }

  get nodes() {
    return this._nodes;
  }

  get round() {
    return this._round;
  }

  set nodes(value: ILeaderboardNodeValue[]) {
    this._nodes = value;
  }

  set round(value: RoundEntity) {
    this._round = value;
  }

  toJSON(): ILeaderboardEntityJSON {
    return {
      id: this._id,
      round: this.round,
      nodes: this._nodes,
    };
  }
}
