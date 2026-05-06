import { Entity } from '../../../common/domain/Entity';
import { Color } from '../objects/Color.object';
import { randomUUID } from 'crypto';
import { ApiError, TaskErrors } from '../../../error/ApiError';

export interface ICreateTask {
  name: string;
  description: string;
  color: Color;
}

export interface ITaskPlain {
  id: string;
  name: string;
  description: string;
  color: Color;
}

export class TaskEntity extends Entity {
  public readonly id: string;
  private _name: string;
  private _description: string;
  private _color: Color;

  private constructor(data: ITaskPlain) {
    super();
    this._name = data.name;
    this._description = data.description;
    this._color = data.color;
    this.id = data.id;
  }

  private static validate(name: string, description: string) {
    if (name.trim().length === 0 || name.trim().length > 255) {
      ApiError.throw(TaskErrors.NAME_LENGTH_RESTRICTION);
    }
    if (description.trim().length === 0 || description.trim().length > 2000) {
      ApiError.throw(TaskErrors.DESCRIPTION_LENGTH_RESTRICTION);
    }
  }

  public static create(data: ICreateTask) {
    this.validate(data.name, data.description);
    return new TaskEntity({
      ...data,
      id: randomUUID(),
    });
  }

  public static load(data: ITaskPlain) {
    this.validate(data.name, data.description);
    return new TaskEntity(data);
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get color() {
    return this._color;
  }

  set name(name: string) {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 255) {
      ApiError.throw(TaskErrors.NAME_LENGTH_RESTRICTION);
    }
    this._name = trimmed;
  }

  set description(description: string) {
    const trimmed = description.trim();
    if (trimmed.length === 0 || trimmed.length > 2000) {
      ApiError.throw(TaskErrors.DESCRIPTION_LENGTH_RESTRICTION);
    }
    this._description = trimmed;
  }
  set color(color: Color) {
    this._color = color;
  }

  toJSON(): ITaskPlain {
    return {
      id: this.id,
      color: this.color,
      description: this.description,
      name: this.name,
    };
  }
}
