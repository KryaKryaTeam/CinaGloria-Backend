import { Entity } from 'src/common/domain/Entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionRule } from '../objects/CompetitionRule.object';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { randomUUID } from 'crypto';
import { RoundEntity } from './Round.entity';

export interface ICompetitionInList {
  id: string;
  name: string;
  banner: InternalFile<'competition:banner'>;
  avatar: InternalFile<'competition:avatar'>;
  dateOfStart: Date;
  dateOfEnd: Date;
  dateOfStartRegistration: Date;
  dateOfEndRegistration: Date;
  status: CompetitionStatus;
}

export interface ICompetitionOnPage {
  id: string;
  name: string;
  description: string;
  banner: InternalFile<'competition:ultraWideBanner'>;
  avatar: InternalFile<'competition:avatar'>;
  socialMedia: InternalFile<'competition:socialMedia'>;
  dateOfStart: Date;
  dateOfEnd: Date;
  dateOfStartRegistration: Date;
  dateOfEndRegistration: Date;
  status: CompetitionStatus;
  rules: CompetitionRule[];
}

export interface ICompetitionPlain {
  id: string;
  name: string | null;
  description: string | null;
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | null;
  banner: InternalFile<'competition:banner'> | null;
  avatar: InternalFile<'competition:avatar'> | null;
  socialMedia: InternalFile<'competition:socialMedia'> | null;
  dateOfStart: Date | null;
  dateOfEnd: Date | null;
  dateOfStartRegistration: Date | null;
  dateOfEndRegistration: Date | null;
  publishAt: Date | null;
  status: CompetitionStatus;
  rules: CompetitionRule[];
}

export interface ICreateCompetition {
  name: string | null;
  description: string | null;
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | null;
  banner: InternalFile<'competition:banner'> | null;
  avatar: InternalFile<'competition:avatar'> | null;
  socialMedia: InternalFile<'competition:socialMedia'> | null;
  dateOfStart: Date | null;
  dateOfEnd: Date | null;
  dateOfStartRegistration: Date | null;
  dateOfEndRegistration: Date | null;
  rules: CompetitionRule[];
}

export class CompetitionEntity extends Entity {
  public readonly id: string;
  private _name: string | null;
  private _description: string | null;

  private _ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | null;
  private _banner: InternalFile<'competition:banner'> | null;
  private _avatar: InternalFile<'competition:avatar'> | null;
  private _socialMedia: InternalFile<'competition:socialMedia'> | null;

  private _dateOfStart: Date | null;
  private _dateOfEnd: Date | null;
  private _dateOfStartRegistration: Date | null;
  private _dateOfEndRegistration: Date | null;
  private _publishAt: Date | null;

  private _status: CompetitionStatus;
  private _rules: CompetitionRule[];
  private _rounds: RoundEntity[];

  private readonly createdAt: Date;

  /* some relations from other modules like tasks or judging */

  private constructor(plain: ICompetitionPlain) {
    super();
    this.id = plain.id;
    this._name = plain.name;
    this._description = plain.description;
    this._ultraWideBanner = plain.ultraWideBanner;
    this._banner = plain.banner;
    this._avatar = plain.avatar;
    this._socialMedia = plain.socialMedia;
    this._publishAt = plain.publishAt;
    this._dateOfStart = plain.dateOfStart;
    this._dateOfEnd = plain.dateOfEnd;
    this._dateOfStartRegistration = plain.dateOfStartRegistration;
    this._dateOfEndRegistration = plain.dateOfEndRegistration;
    this._status = plain.status;
    this._rules = plain.rules || [];
  }

  private static validate(plain: ICompetitionPlain | ICreateCompetition) {
    if (
      !CompetitionEntity.datesValid(
        new Date(),
        plain.dateOfStartRegistration,
        plain.dateOfEndRegistration,
        plain.dateOfStart,
        plain.dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    if (
      (plain.name && plain.name.trim().length == 0) ||
      (plain.name && plain.name.trim().length > 255)
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    if (
      (plain.description && plain.description.trim().length == 0) ||
      (plain.description && plain.description.trim().length > 1000)
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
  }

  public static load(plain: ICompetitionPlain) {
    CompetitionEntity.validate(plain);

    const filledIn = [
      plain.name,
      plain.description,
      plain.banner,
      plain.avatar,
      plain.dateOfEnd,
      plain.dateOfEndRegistration,
      plain.dateOfStart,
      plain.dateOfStartRegistration,
      plain.ultraWideBanner,
      plain.socialMedia,
    ].every((el) => el !== null);

    if (
      !(
        plain.rules.length > 0 &&
        filledIn &&
        plain.status != CompetitionStatus.DRAFT
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return new CompetitionEntity(plain);
  }

  public static create(plain: ICreateCompetition) {
    CompetitionEntity.validate(plain);
    return new CompetitionEntity({
      ...plain,
      id: randomUUID(),
      rules: plain.rules || [],
      status: CompetitionStatus.DRAFT,
      publishAt: null,
    });
  }

  private get isDraft(): boolean {
    return this._status == CompetitionStatus.DRAFT;
  }

  private get canBeChanged(): boolean {
    if (
      this._status == CompetitionStatus.DRAFT ||
      this._status == CompetitionStatus.PUBLISHED
    )
      return true;
    return false;
  }

  private get canBePublished(): boolean {
    const filledIn = [
      this._name,
      this._description,
      this._banner,
      this._avatar,
      this._dateOfEnd,
      this._dateOfEndRegistration,
      this._dateOfStart,
      this._dateOfStartRegistration,
      this._ultraWideBanner,
      this._socialMedia,
    ].every((el) => el != null);
    return this._rules.length > 0 && filledIn;
  }

  private canChangeStatusTo(newStatus: CompetitionStatus): boolean {
    const allowedTransitions: Record<CompetitionStatus, CompetitionStatus[]> = {
      [CompetitionStatus.DRAFT]: [
        CompetitionStatus.PUBLISHED,
        CompetitionStatus.SCHEDULED,
      ],
      [CompetitionStatus.SCHEDULED]: [
        CompetitionStatus.DRAFT,
        CompetitionStatus.PUBLISHED,
      ],
      [CompetitionStatus.PUBLISHED]: [
        CompetitionStatus.CANCELED,
        CompetitionStatus.REGISTRATION,
      ],
      [CompetitionStatus.REGISTRATION]: [
        CompetitionStatus.CANCELED,
        CompetitionStatus.WAITING_FOR_START,
        CompetitionStatus.STARTED,
      ],
      [CompetitionStatus.WAITING_FOR_START]: [
        CompetitionStatus.CANCELED,
        CompetitionStatus.STARTED,
      ],
      [CompetitionStatus.STARTED]: [
        CompetitionStatus.CANCELED,
        CompetitionStatus.SCORING,
      ],
      [CompetitionStatus.SCORING]: [
        CompetitionStatus.ARCHIVED,
        CompetitionStatus.CANCELED,
        CompetitionStatus.STARTED, // якщо у змагання наприклад два раунди
      ],
      [CompetitionStatus.ARCHIVED]: [],
      [CompetitionStatus.CANCELED]: [],
    };

    const possibleStatuses = allowedTransitions[this._status] ?? [];

    if (
      newStatus == CompetitionStatus.PUBLISHED ||
      newStatus == CompetitionStatus.SCHEDULED
    )
      return this.canBePublished && possibleStatuses.includes(newStatus);

    return possibleStatuses.includes(newStatus);
  }

  private canChangeCheck() {
    if (!this.canBeChanged) throw new DomainError(DomainErrors.IMMUTABLE_VALUE);
  }

  private static datesValid(
    publishAt: Date | null,
    startReg: Date | null,
    endReg: Date | null,
    start: Date | null,
    end: Date | null,
  ): boolean {
    if (publishAt && startReg && publishAt >= startReg) return false;
    if (startReg && endReg && startReg >= endReg) return false;
    if (endReg && start && endReg > start) return false;
    if (start && end && start >= end) return false;

    return true;
  }

  set name(value: string) {
    this.canChangeCheck();

    if (value.trim().length == 0 || value.trim().length > 255)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._name = value.trim();
  }

  set description(value: string) {
    this.canChangeCheck();

    if (value.trim().length == 0 || value.trim().length > 1000)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._description = value.trim();
  }

  set dateOfStart(value: Date) {
    this.canChangeCheck();

    if (
      !CompetitionEntity.datesValid(
        this._publishAt,
        this._dateOfStartRegistration,
        this._dateOfEndRegistration,
        value,
        this._dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._dateOfStart = value;
  }

  set dateOfEnd(value: Date) {
    this.canChangeCheck();

    if (
      !CompetitionEntity.datesValid(
        this._publishAt,
        this._dateOfStartRegistration,
        this._dateOfEndRegistration,
        this._dateOfStart,
        value,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._dateOfEnd = value;
  }

  set dateOfStartRegistration(value: Date) {
    this.canChangeCheck();

    if (
      !CompetitionEntity.datesValid(
        this._publishAt,
        value,
        this._dateOfEndRegistration,
        this._dateOfStart,
        this._dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._dateOfStartRegistration = value;
  }

  set dateOfEndRegistration(value: Date) {
    this.canChangeCheck();

    if (
      !CompetitionEntity.datesValid(
        this._publishAt,
        this._dateOfStartRegistration,
        value,
        this._dateOfStart,
        this._dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._dateOfEndRegistration = value;
  }

  public schedule(date: Date) {
    this.canChangeCheck();

    if (!this.canChangeStatusTo(CompetitionStatus.SCHEDULED))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (
      !CompetitionEntity.datesValid(
        date,
        this._dateOfStartRegistration,
        this._dateOfEndRegistration,
        this._dateOfStart,
        this._dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._status = CompetitionStatus.SCHEDULED;
    this._publishAt = date;
  }

  public declineScheduledPublish() {
    this.canChangeCheck();

    if (!this.canChangeStatusTo(CompetitionStatus.DRAFT))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    this._status = CompetitionStatus.DRAFT;
    this._publishAt = null;
  }

  set ultraWideBanner(value: InternalFile<'competition:ultraWideBanner'>) {
    this.canChangeCheck();
    this._ultraWideBanner = value;
  }
  set banner(value: InternalFile<'competition:banner'>) {
    this.canChangeCheck();
    this._banner = value;
  }
  set avatar(value: InternalFile<'competition:avatar'>) {
    this.canChangeCheck();
    this._avatar = value;
  }
  set socialMedia(value: InternalFile<'competition:socialMedia'>) {
    this.canChangeCheck();
    this._socialMedia = value;
  }

  public addRule(rule: CompetitionRule | CompetitionRule[]) {
    this.canChangeCheck();
    if (Array.isArray(rule)) {
      rule.forEach((el) => this._rules.push(el));
    } else {
      this._rules.push(rule);
    }
  }

  public deleteRule(index: number) {
    this.canChangeCheck();
    this._rules.splice(index, 1);
  }

  public addRound(round: RoundEntity) {
    this.canChangeCheck();
    this._rounds.push(round);
  }

  public deleteRound(round: RoundEntity) {
    this.canChangeCheck();
    const i = this._rounds.findIndex((r) => r.id == round.id);
    if (i == -1) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    this._rounds.splice(i, 1);
  }

  set status(value: CompetitionStatus) {
    if (value == CompetitionStatus.SCHEDULED)
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (!this.canChangeStatusTo(value))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);
    this._status = value;
  }

  get name(): string | null {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get ultraWideBanner(): InternalFile<'competition:ultraWideBanner'> | null {
    return this._ultraWideBanner;
  }
  get banner(): InternalFile<'competition:banner'> | null {
    return this._banner;
  }
  get avatar(): InternalFile<'competition:avatar'> | null {
    return this._avatar;
  }
  get socialMedia(): InternalFile<'competition:socialMedia'> | null {
    return this._socialMedia;
  }
  get dateOfStart(): Date | null {
    return this._dateOfStart;
  }
  get dateOfEnd(): Date | null {
    return this._dateOfEnd;
  }
  get dateOfStartRegistration(): Date | null {
    return this._dateOfStartRegistration;
  }
  get dateOfEndRegistration(): Date | null {
    return this._dateOfEndRegistration;
  }
  get publishAt(): Date | null {
    return this._publishAt;
  }
  get status() {
    return this._status;
  }
  get rules() {
    return [...this._rules];
  }

  get publicInList(): ICompetitionInList | void {
    if (!this.isDraft)
      return {
        id: this.id,
        name: this._name!,
        banner: this._banner!,
        avatar: this._avatar!,
        dateOfStart: this._dateOfStart!,
        dateOfEnd: this._dateOfEnd!,
        dateOfStartRegistration: this._dateOfStartRegistration!,
        dateOfEndRegistration: this._dateOfEndRegistration!,
        status: this._status,
      };
  }
  get publicOnPage(): ICompetitionOnPage | void {
    if (!this.isDraft)
      return {
        id: this.id,
        name: this._name!,
        description: this._description!,
        banner: this._ultraWideBanner!,
        socialMedia: this._socialMedia!,
        avatar: this._avatar!,
        dateOfStart: this._dateOfStart!,
        dateOfEnd: this._dateOfEnd!,
        dateOfStartRegistration: this._dateOfStartRegistration!,
        dateOfEndRegistration: this._dateOfEndRegistration!,
        rules: this.rules,
        status: this._status,
      };
  }

  get toJSON(): ICompetitionPlain {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      ultraWideBanner: this._ultraWideBanner,
      banner: this._banner,
      socialMedia: this._socialMedia,
      avatar: this._avatar,
      dateOfStart: this._dateOfStart,
      dateOfEnd: this._dateOfEnd,
      dateOfStartRegistration: this._dateOfStartRegistration,
      dateOfEndRegistration: this._dateOfEndRegistration,
      publishAt: this._publishAt,
      rules: this.rules,
      status: this._status,
    };
  }
}
