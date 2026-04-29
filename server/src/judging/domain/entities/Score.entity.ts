import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

export interface IScorePlain {
  id: string;
  score: number;
  team: string;
  task: TaskEntity;
}

export interface ICreateScore {
  score: number;
  team: string;
  task: TaskEntity;
}

export interface IScoreEntityJSON {
  id: string;
  score: number;
  team: string;
  task: TaskEntity;
}

// The score per task
export class ScoreEntity extends Entity {
  public readonly _id: string;
  public _score: number;
  public _team: string; // you can change it to team entity if you wish
  public _task: TaskEntity;

  private constructor(data: IScorePlain) {
    super();

    this._id = data.id;
    this._score = data.score;
    this._team = data.team;
    this._task = data.task;
  }

  static load(data: IScorePlain) {
    return new ScoreEntity(data);
  }

  static create(data: ICreateScore) {
    return { id: randomUUID(), ...data };
  }

  set score(value: number) {
    this._score = value;
  }

  get team() {
    return this._team;
  }

  get score() {
    return this._score;
  }

  get id() {
    return this._id;
  }

  get task() {
    return this._task;
  }

  toJSON(): IScoreEntityJSON {
    return {
      id: this._id,
      score: this._score,
      team: this._team,
      task: this._task,
    };
  }
}
