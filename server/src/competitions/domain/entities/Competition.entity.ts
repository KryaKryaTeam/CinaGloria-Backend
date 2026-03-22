import { Entity } from 'src/common/domain/Entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionRule } from '../objects/CompetitionRule.object';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { randomUUID } from 'crypto';

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
  name: string | undefined;
  description: string | undefined;
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | undefined;
  banner: InternalFile<'competition:banner'> | undefined;
  avatar: InternalFile<'competition:avatar'> | undefined;
  socialMedia: InternalFile<'competition:socialMedia'> | undefined;
  dateOfStart: Date | undefined;
  dateOfEnd: Date | undefined;
  dateOfStartRegistration: Date | undefined;
  dateOfEndRegistration: Date | undefined;
  status: CompetitionStatus;
  rules: CompetitionRule[];
}

export interface ICreateCompetition {
  name: string | undefined;
  description: string | undefined;
  ultraWideBanner: InternalFile<'competition:ultraWideBanner'> | undefined;
  banner: InternalFile<'competition:banner'> | undefined;
  avatar: InternalFile<'competition:avatar'> | undefined;
  socialMedia: InternalFile<'competition:socialMedia'> | undefined;
  dateOfStart: Date | undefined;
  dateOfEnd: Date | undefined;
  dateOfStartRegistration: Date | undefined;
  dateOfEndRegistration: Date | undefined;
  rules: CompetitionRule[];
}

export class CompetitionEntity extends Entity {
  public readonly id: string;
  private _name: string | undefined;
  private _description: string | undefined;

  private _ultraWideBanner:
    | InternalFile<'competition:ultraWideBanner'>
    | undefined;
  private _banner: InternalFile<'competition:banner'> | undefined;
  private _avatar: InternalFile<'competition:avatar'> | undefined;
  private _socialMedia: InternalFile<'competition:socialMedia'> | undefined;

  private _dateOfStart: Date | undefined;
  private _dateOfEnd: Date | undefined;
  private _dateOfStartRegistration: Date | undefined;
  private _dateOfEndRegistration: Date | undefined;

  private _status: CompetitionStatus;

  private _rules: CompetitionRule[];

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
    ].every((el) => typeof el !== 'undefined');

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
    ].every((el) => typeof el !== 'undefined');

    return this._rules.length > 0 && filledIn;
  }

  private canChangeStatusTo(newStatus: CompetitionStatus): boolean {
    const allowedTransitions: Record<CompetitionStatus, CompetitionStatus[]> = {
      [CompetitionStatus.DRAFT]: [CompetitionStatus.PUBLISHED],
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

    if (newStatus == CompetitionStatus.PUBLISHED)
      return this.canBePublished && possibleStatuses.includes(newStatus);

    return possibleStatuses.includes(newStatus);
  }

  private canChangeCheck() {
    if (!this.canBeChanged) throw new DomainError(DomainErrors.IMMUTABLE_VALUE);
  }

  private static datesValid(
    _startOfReg: Date | undefined,
    _endOfReg: Date | undefined,
    _start: Date | undefined,
    _end: Date | undefined,
  ) {
    const startOfReg = _startOfReg?.getTime() || 0;
    const endOfReg = _endOfReg?.getTime() || startOfReg + 1;
    const start = _start?.getTime() || endOfReg + 1;
    const end = _end?.getTime() || start + 1;

    if (
      startOfReg < endOfReg &&
      (endOfReg < start || endOfReg == start) &&
      start < end
    )
      return true;

    return false;
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
        this._dateOfStartRegistration,
        value,
        this._dateOfStart,
        this._dateOfEnd,
      )
    )
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._dateOfEndRegistration = value;
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

  set status(value: CompetitionStatus) {
    if (!this.canChangeStatusTo(value))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);
    this._status = value;
  }

  get name(): string | undefined {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get ultraWideBanner():
    | InternalFile<'competition:ultraWideBanner'>
    | undefined {
    return this._ultraWideBanner;
  }
  get banner(): InternalFile<'competition:banner'> | undefined {
    return this._banner;
  }
  get avatar(): InternalFile<'competition:avatar'> | undefined {
    return this._avatar;
  }
  get socialMedia(): InternalFile<'competition:socialMedia'> | undefined {
    return this._socialMedia;
  }
  get dateOfStart(): Date | undefined {
    return this._dateOfStart;
  }
  get dateOfEnd(): Date | undefined {
    return this._dateOfEnd;
  }
  get dateOfStartRegistration(): Date | undefined {
    return this._dateOfStartRegistration;
  }
  get dateOfEndRegistration(): Date | undefined {
    return this._dateOfEndRegistration;
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
      rules: this.rules,
      status: this._status,
    };
  }
}
