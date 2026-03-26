import { Entity } from 'src/common/domain/Entity';
import { Color } from '../objects/Color.object';
import { randomUUID } from 'crypto';

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

  public static create(data: ICreateTask) {
    return new TaskEntity({
      ...data,
      id: randomUUID(),
    });
  }

  public static load(data: ITaskPlain) {
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
    this._name = name;
  }

  set description(description: string) {
    this._description = description;
  }

  set color(color: Color) {
    this._color = color;
  }
}
