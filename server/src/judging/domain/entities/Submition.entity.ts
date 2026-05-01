import { Entity } from 'src/common/domain/Entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { randomUUID } from 'crypto';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';

export interface ICreateSubmition {
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string;
  relatedTasks: TaskEntity[];
}

export interface ISubmitionPlain {
  id: string;
  createdAt: Date;
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string;
  relatedTasks: TaskEntity[];
}

export interface ISubmitionEntityJSON {
  id: string;
  createdAt: Date;
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string;
  relatedTasks: TaskEntity[];
}

export class SubmitionEntity extends Entity {
  public readonly _id: string;
  public _createdAt: Date;
  public _githubURL: string;
  public _youtubeURL: string;
  public _assignedToJury: string;
  public _relatedTasks: TaskEntity[];

  private constructor(data: ISubmitionPlain) {
    super();

    this._id = data.id;
    this._createdAt = data.createdAt;
    this._githubURL = data.githubURL;
    this._youtubeURL = data.youtubeURL;
    this._assignedToJury = data.assignedToJury;
    this._relatedTasks = data.relatedTasks;
  }

  static validate(
    githubURL: string,
    youtubeURL: string,
    assignedToJury: string,
    relatedTasks: TaskEntity[],
  ) {
    if (githubURL.trim().length == 0)
      ApiError.throw(SubmitionErrors.NO_GITHUB_URL);
    if (youtubeURL.trim().length == 0)
      ApiError.throw(SubmitionErrors.NO_YOUTUBE_URL);
    if (assignedToJury.trim().length == 0)
      ApiError.throw(SubmitionErrors.NO_JURY);
    if (relatedTasks.length == 0)
      ApiError.throw(SubmitionErrors.NO_RELATED_TASKS);
  }

  static load(data: ISubmitionPlain) {
    this.validate(
      data.githubURL,
      data.youtubeURL,
      data.assignedToJury,
      data.relatedTasks,
    );
    return new SubmitionEntity(data);
  }

  static create(data: ICreateSubmition) {
    this.validate(
      data.githubURL,
      data.youtubeURL,
      data.assignedToJury,
      data.relatedTasks,
    );
    return new SubmitionEntity({
      id: randomUUID(),
      createdAt: new Date(),
      ...data,
    });
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  get githubURL(): string {
    return this._githubURL;
  }

  set githubURL(value: string) {
    this._githubURL = value;
  }

  get youtubeURL(): string {
    return this._youtubeURL;
  }

  set youtubeURL(value: string) {
    this._youtubeURL = value;
  }

  get assignedToJury(): string {
    return this._assignedToJury;
  }

  set assignedToJury(value: string) {
    this._assignedToJury = value;
  }

  get relatedTasks(): TaskEntity[] {
    return [...this._relatedTasks];
  }

  set relatedTasks(value: TaskEntity[]) {
    this._relatedTasks = value;
  }

  toJSON(): ISubmitionEntityJSON {
    return {
      id: this.id,
      createdAt: this.createdAt,
      assignedToJury: this.assignedToJury,
      githubURL: this.githubURL,
      youtubeURL: this.youtubeURL,
      relatedTasks: this.relatedTasks,
    };
  }
}
