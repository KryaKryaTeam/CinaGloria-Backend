import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { Icons } from 'src/types/Icons';
import { RoundStatus } from 'src/types/RoundStatus';
import { TaskEntity } from './Task.entity';
import { ApiError, DomainErrors, RoundErrors } from 'src/error/ApiError';

export interface ICreateRound {
  name: string;
  description: string;
  icon: Icons;
  startOfRound: Date;
  taskTimeout: Date;
  endOfRound: Date;
  relatedTasks: TaskEntity[];
  hidden: boolean;
}

export interface IRoundPlain {
  id: string;
  name: string;
  hidden: boolean;
  description: string;
  icon: Icons;
  startOfRound: Date;
  endOfRound: Date;
  taskTimeout: Date;
  relatedTasks: TaskEntity[];
  status: RoundStatus;
}

export class RoundEntity extends Entity {
  public readonly id: string;
  private _hidden: boolean;
  private _name: string;
  private _description: string;
  private _icon: Icons;
  private _startOfRound: Date;
  private _taskTimeout: Date;
  private _endOfRound: Date;
  private _relatedTasks: TaskEntity[];
  private _status: RoundStatus;

  private constructor(plain: IRoundPlain) {
    RoundEntity.validate(plain);
    super();
    this.id = plain.id;
    this._hidden = plain.hidden;
    this._name = plain.name;
    this._description = plain.description;
    this._icon = plain.icon;
    this._startOfRound = plain.startOfRound;
    this._taskTimeout = plain.taskTimeout;
    this._endOfRound = plain.endOfRound;
    this._relatedTasks = plain.relatedTasks;
    this._status = plain.status;
  }

  public static validate(plain: IRoundPlain): void {
    if (plain.name.trim().length == 0 || plain.name.trim().length > 255)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    if (
      plain.description.trim().length == 0 ||
      plain.description.trim().length > 1000
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    if (
      plain.endOfRound.getTime() <= plain.taskTimeout.getTime() ||
      plain.taskTimeout.getTime() <= plain.startOfRound.getTime()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
  }

  public static create(data: ICreateRound) {
    return new RoundEntity({
      ...data,
      id: randomUUID(),
      status: RoundStatus.CREATED,
    });
  }

  public static load(data: IRoundPlain) {
    return new RoundEntity(data);
  }

  public static createFake(): RoundEntity {
    const fakeData: IRoundPlain = {
      id: randomUUID(),
      name: 'Fake Round',
      hidden: false,
      description: 'This is a fake round for testing purposes.',
      icon: Icons.BOOK,
      startOfRound: new Date(Date.now() + 1000000),
      endOfRound: new Date(Date.now() + 2000000),
      taskTimeout: new Date(Date.now() + 1500000),
      relatedTasks: [],
      status: RoundStatus.CREATED,
    };

    return RoundEntity.load(fakeData);
  }

  private canChangeStatusTo(status: RoundStatus): boolean {
    const allowedTransitions: Record<RoundStatus, RoundStatus[]> = {
      [RoundStatus.CREATED]: [RoundStatus.IN_PROGRESS],
      [RoundStatus.IN_PROGRESS]: [RoundStatus.ON_JUDGING],
      [RoundStatus.ON_JUDGING]: [RoundStatus.FINISHED],
      [RoundStatus.FINISHED]: [],
    };

    const possibleStatuses = allowedTransitions[this._status] ?? [];

    return possibleStatuses.includes(status);
  }

  public hide() {
    this._hidden = true;
  }

  public show() {
    this._hidden = false;
  }

  set name(name: string) {
    if (name.trim().length == 0 || name.trim().length > 255)
      ApiError.throw(RoundErrors.CONTENT_LENGTH_RESTRICTION);
    this._name = name;
  }
  set description(description: string) {
    if (description.trim().length == 0 || description.trim().length > 1000)
      ApiError.throw(RoundErrors.CONTENT_LENGTH_RESTRICTION);
    this._description = description;
  }

  set icon(icon: Icons) {
    this._icon = icon;
  }

  set startOfRound(date: Date) {
    if (date < new Date()) ApiError.throw(RoundErrors.START_DATE_INVALID);

    if (this._endOfRound && date.getTime() >= this._endOfRound.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);
    if (this._taskTimeout && date.getTime() >= this._taskTimeout.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);

    this._startOfRound = date;
  }

  set taskTimeout(date: Date) {
    if (date < new Date()) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    if (this._startOfRound && date.getTime() >= this._startOfRound.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);

    if (this._endOfRound && date.getTime() <= this._endOfRound.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);

    this._taskTimeout = date;
  }

  set endOfRound(date: Date) {
    if (date < new Date()) ApiError.throw(RoundErrors.END_DATE_INVALID);

    if (this._startOfRound && date.getTime() <= this._startOfRound.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);
    if (this._taskTimeout && date.getTime() <= this._taskTimeout.getTime())
      ApiError.throw(RoundErrors.INVALID_DATE_SEQUENCE);

    this._endOfRound = date;
  }

  set status(status: RoundStatus) {
    if (!this.canChangeStatusTo(status))
      ApiError.throw(RoundErrors.STATUS_FLOW_BREAKS);
    this._status = status;
  }

  get name() {
    return this._name ?? '';
  }

  get description() {
    return this._description ?? '';
  }

  get icon(): Icons {
    return this._icon;
  }

  get startOfRound() {
    return this._startOfRound;
  }

  get taskTimeout() {
    return this._taskTimeout;
  }

  get endOfRound(): Date {
    return this._endOfRound;
  }

  get relatedTasks() {
    return this._relatedTasks;
  }

  get status() {
    return this._status;
  }

  get hidden() {
    return this._hidden;
  }

  addTask(task: TaskEntity) {
    this._relatedTasks.push(task);
  }

  removeTask(task: TaskEntity) {
    const i: number = this._relatedTasks.findIndex((t) => {
      if (t.id == task.id) return true;
    });
    if (i == -1) ApiError.throw(RoundErrors.TASK_NOT_FOUND_IN_ROUND);
    this._relatedTasks.splice(i, 1);
  }
  toJSON(): IRoundPlain {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startOfRound: this._startOfRound,
      taskTimeout: this._taskTimeout,
      status: this.status,
      hidden: this.hidden,
      endOfRound: this.endOfRound,
      icon: this.icon,
      relatedTasks: this.relatedTasks,
    };
  }
}
