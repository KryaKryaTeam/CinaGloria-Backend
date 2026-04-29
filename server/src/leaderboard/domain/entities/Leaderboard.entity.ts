import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { CriteriaEntity } from 'src/task-collector/domain/entities/Criteria.entity';

export interface ICreateLeaderboard {
  value: number;
  criteria: CriteriaEntity;
  task: TaskEntity;
}

export interface ILeaderboardPlain {
  id: string;
  value: number;
  criteria: CriteriaEntity;
  task: TaskEntity;
}

export interface ILeaderboardEntityJSON {
  id: string;
  value: number;
  criteria: CriteriaEntity;
  task: TaskEntity;
}

export class LeaderboardEntity extends Entity {
  public readonly _id: string;
  private _value: number;
  private _criteria: CriteriaEntity;
  private _task: TaskEntity;

  private constructor(data: ILeaderboardPlain) {
    super();
    this._id = data.id;
    this._value = data.value;
    this._criteria = data.criteria;
    this._task = data.task;
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

  get id(): string {
    return this._id;
  }

  get value(): number {
    return this._value;
  }

  get criteria(): CriteriaEntity {
    return this._criteria;
  }

  get task(): TaskEntity {
    return this._task;
  }

  set value(newValue: number) {
    if (newValue < 0) {
      throw new Error('Leaderboard value cannot be negative');
    }
    this._value = newValue;
  }

  set criteria(criteria: CriteriaEntity) {
    this._criteria = criteria;
  }

  set task(task: TaskEntity) {
    this._task = task;
  }

  toJSON(): ILeaderboardEntityJSON {
    return {
      id: this._id,
      value: this._value,
      criteria: this._criteria,
      task: this._task,
    };
  }
}
