import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { ApiError, CriteriaErrors } from 'src/error/ApiError';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { Icons } from 'src/types/Icons';

export interface ICriteriaPlain {
  id: string;
  visibility: boolean;
  name: string;
  description: string;
  icon: Icons;
  score: number;
}

export interface ICreateCriteria {
  visibility: boolean;
  name: string;
  description: string;
  icon: Icons;
  score: number;
}

export interface ICriteriaEntityJSON {
  id: string;
  visibility: boolean;
  name: string;
  description: string;
  icon: Icons;
  score: number;
}

export class CriteriaEntity extends Entity {
  public readonly _id: string;
  public _visibility: boolean;
  public _name: string;
  public _description: string;
  public _icon: Icons;
  public _team: TeamEntity;
  public _score: number;

  private constructor(data: ICriteriaPlain) {
    super();

    this._id = data.id;
    this._name = data.name;
    this._visibility = data.visibility;
    this._description = data.description;
    this._icon = data.icon;
    this._score = data.score;
  }

  static load(data: ICriteriaPlain) {
    this.validate(data.name, data.description, data.score);
    return new CriteriaEntity(data);
  }

  static create(data: ICreateCriteria) {
    this.validate(data.name, data.description, data.score);
    return new CriteriaEntity({
      id: randomUUID(),
      ...data,
    });
  }

  static validate(name: string, description: string, score: number) {
    if (name.trim().length == 0) ApiError.throw(CriteriaErrors.NO_NAME);
    if (name.trim().length > 255)
      ApiError.throw(CriteriaErrors.NAME_IS_TOO_BIG);
    if (description.trim().length > 1000)
      ApiError.throw(CriteriaErrors.DESCRIPTION_TOO_BIG);
    if (score <= 0) ApiError.throw(CriteriaErrors.NEGATIVE_OR_ZERO_SCORE);
  }

  set visibility(value: boolean) {
    this._visibility = value;
  }

  set name(value: string) {
    this._name = value;
  }

  set description(value: string) {
    this._description = value;
  }

  set icon(value: Icons) {
    this._icon = value;
  }

  set score(value: number) {
    this._score = value;
  }

  get id() {
    return this._id;
  }

  get visibility() {
    return this._visibility;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get icon() {
    return this._icon;
  }

  get score() {
    return this._score;
  }

  toJSON(): ICriteriaEntityJSON {
    return {
      id: this._id,
      description: this._description,
      icon: this._icon,
      visibility: this._visibility,
      name: this._name,
      score: this._score,
    };
  }
}
