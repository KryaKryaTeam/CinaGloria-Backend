import { Entity } from 'src/common/domain/Entity';
import { randomUUID } from 'crypto';
import { ApiError, SubmitionErrors } from 'src/error/ApiError';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundReviewEntity } from './RoundReview.entity';

export interface ICreateSubmition {
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string | undefined;
  relatedRound: RoundEntity;
  review: RoundReviewEntity | undefined;
}

export interface ISubmitionPlain {
  id: string;
  createdAt: Date;
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string | undefined;
  relatedRound: RoundEntity;
  review: RoundReviewEntity | undefined;
}

export interface ISubmitionEntityJSON {
  id: string;
  createdAt: Date;
  githubURL: string;
  youtubeURL: string;
  assignedToJury: string | undefined;
  relatedRound: RoundEntity;
  review: RoundReviewEntity | undefined;
}

export class SubmitionEntity extends Entity {
  public readonly _id: string;
  public _createdAt: Date;
  public _githubURL: string;
  public _youtubeURL: string;
  public _assignedToJury: string | undefined;
  public _relatedRound: RoundEntity;
  public _review: RoundReviewEntity | undefined;

  private constructor(data: ISubmitionPlain) {
    super();

    this._id = data.id;
    this._createdAt = data.createdAt;
    this._githubURL = data.githubURL;
    this._youtubeURL = data.youtubeURL;
    this._assignedToJury = data.assignedToJury;
    this._relatedRound = data.relatedRound;
    this._review = data.review;
  }

  static validate(
    githubURL: string,
    youtubeURL: string,
    relatedRound: RoundEntity,
  ) {
    if (githubURL.trim().length == 0)
      ApiError.throw(SubmitionErrors.NO_GITHUB_URL);
    if (youtubeURL.trim().length == 0)
      ApiError.throw(SubmitionErrors.NO_YOUTUBE_URL);
    if (!relatedRound) ApiError.throw(SubmitionErrors.NO_RELATED_ROUND);
  }

  static load(data: ISubmitionPlain) {
    this.validate(data.githubURL, data.youtubeURL, data.relatedRound);
    return new SubmitionEntity(data);
  }

  static create(data: ICreateSubmition) {
    this.validate(data.githubURL, data.youtubeURL, data.relatedRound);
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

  get assignedToJury(): string | undefined {
    return this._assignedToJury;
  }

  set assignedToJury(value: string) {
    this._assignedToJury = value;
  }

  get relatedRound(): RoundEntity {
    return this._relatedRound;
  }

  set relatedRound(value: RoundEntity) {
    this._relatedRound = value;
  }

  get review(): RoundReviewEntity | undefined {
    return this._review;
  }

  set review(value: RoundReviewEntity) {
    this._review = value;
  }

  toJSON(): ISubmitionEntityJSON {
    return {
      id: this.id,
      createdAt: this.createdAt,
      assignedToJury: this.assignedToJury,
      githubURL: this.githubURL,
      youtubeURL: this.youtubeURL,
      relatedRound: this.relatedRound,
      review: this.review,
    };
  }
}
