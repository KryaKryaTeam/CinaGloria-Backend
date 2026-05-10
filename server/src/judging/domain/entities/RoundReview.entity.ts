import { Entity } from 'src/common/domain/Entity';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ScoreEntity } from './Score.entity';
import { ApiError, RoundReviewErrors } from 'src/error/ApiError';
import { SubmitionEntity } from './Submition.entity';
import { randomUUID } from 'crypto';

export interface ICreateRoundReview {
  summary: number;
  description: string;
  byJury: string;
  round: RoundEntity;
  relatedScores: ScoreEntity[];
  submission: SubmitionEntity;
}

export interface IRoundReviewPlain {
  id: string;
  // summary: number;
  description: string;
  byJury: string;
  round: RoundEntity;
  relatedScores: ScoreEntity[];
  submission: SubmitionEntity;
}

export interface IRoundReviewEntityJSON {
  id: string;
  summary: number;
  description: string;
  byJury: string;
  round: RoundEntity;
  relatedScores: ScoreEntity[];
  submission: SubmitionEntity;
}

export class RoundReviewEntity extends Entity {
  public readonly _id: string;
  public _summary: number;
  public _description: string;
  public _byJury: string;
  public _round: RoundEntity;
  public _relatedScores: ScoreEntity[];
  public _submission: SubmitionEntity;

  private constructor(data: IRoundReviewPlain) {
    super();

    this._id = data.id;

    let sum = 0;
    data.relatedScores.forEach((score) => {
      sum += score.score;
    });

    this._summary = sum;
    this._description = data.description;
    this._byJury = data.byJury;
    this._round = data.round;
    this._relatedScores = data.relatedScores;
    this._submission = data.submission;
  }

  static validate(relatedScores: ScoreEntity[]) {
    if (relatedScores.length == 0)
      ApiError.throw(RoundReviewErrors.NO_SCORES_PROVIDED);
  }

  static create(data: ICreateRoundReview) {
    this.validate(data.relatedScores);
    return new RoundReviewEntity({
      id: randomUUID(),
      ...data,
    });
  }

  static load(data: IRoundReviewPlain) {
    this.validate(data.relatedScores);
    return new RoundReviewEntity(data);
  }

  public get id(): string {
    return this._id;
  }

  public get summary(): number {
    return this._summary;
  }

  public set summary(value: number) {
    this._summary = value;
  }

  public get description(): string {
    return this._description;
  }

  public set description(value: string) {
    this._description = value;
  }

  public get byJury(): string {
    return this._byJury;
  }

  public set byJury(value: string) {
    this._byJury = value;
  }

  public get round(): RoundEntity {
    return this._round;
  }

  public set round(value: RoundEntity) {
    this._round = value;
  }

  public get relatedScores(): ScoreEntity[] {
    return this._relatedScores;
  }

  public set submission(value: SubmitionEntity) {
    this._submission = value;
  }

  public get submission() {
    return this._submission;
  }

  addScore(score: ScoreEntity) {
    this._relatedScores.push(score);
  }

  removeScore(id: string) {
    const score = this._relatedScores.findIndex((score) => score.id == id);
    if (score === -1) ApiError.throw(RoundReviewErrors.SCORE_NOT_FOUND);

    this._relatedScores.splice(score, 1);
  }

  toJSON(): IRoundReviewEntityJSON {
    return {
      id: this._id,
      summary: this._summary,
      description: this._description,
      byJury: this._byJury,
      round: this._round,
      relatedScores: this._relatedScores,
      submission: this._submission,
    };
  }
}
