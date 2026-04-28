import { Entity } from 'src/common/domain/Entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionRule } from '../objects/CompetitionRule.object';
import { randomUUID } from 'crypto';
import { IRoundPlain, RoundEntity } from './Round.entity';
import { ApiError, CompetitionErrors, DomainErrors } from 'src/error/ApiError';
import { CompetitionSettings } from '../objects/CompetitionSettings';
import { RoundStatus } from 'src/types/RoundStatus';
import { CompetitionRegistrationStarted } from '../events/CompetititonRegistrationStarted.event';
import { CompetitionStarted } from '../events/CompetitionStarted.event';
import { CompetitionFinished } from '../events/CompetitionFinished.event';
import { CompetitionRegistrationEnded } from '../events/CompetitionRegistrationEnded';
import { ITeamPlain, TeamEntity } from 'src/teams/domain/entities/Team.entity';

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
  name?: string;
  description?: string;
  ultraWideBanner?: InternalFile<'competition:ultraWideBanner'>;
  banner?: InternalFile<'competition:banner'>;
  avatar?: InternalFile<'competition:avatar'>;
  socialMedia?: InternalFile<'competition:socialMedia'>;
  dateOfStart?: Date;
  dateOfEnd?: Date;
  dateOfStartRegistration?: Date;
  dateOfEndRegistration?: Date;
  publishAt?: Date;
  status: CompetitionStatus;
  rules: CompetitionRule[];
  settings: CompetitionSettings;
  rounds: IRoundPlain[];
  teams: ITeamPlain[];
}

export interface ICreateCompetition {
  name?: string;
  description?: string;
  ultraWideBanner?: InternalFile<'competition:ultraWideBanner'>;
  banner?: InternalFile<'competition:banner'>;
  avatar?: InternalFile<'competition:avatar'>;
  socialMedia?: InternalFile<'competition:socialMedia'>;
  dateOfStart?: Date;
  dateOfEnd?: Date;
  dateOfStartRegistration?: Date;
  dateOfEndRegistration?: Date;
  rules: CompetitionRule[];
}

export interface ICreateCompetitionRAW {
  name?: string;
  description?: string;
  ultraWideBanner?: string;
  banner?: string;
  avatar?: string;
  socialMedia?: string;
  dateOfStart?: Date;
  dateOfEnd?: Date;
  dateOfStartRegistration?: Date;
  dateOfEndRegistration?: Date;
  rules: { name: string; description: string; icon: string }[];
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
  private _publishAt: Date | undefined;

  private _status: CompetitionStatus;
  private _rules: CompetitionRule[];
  private _rounds: RoundEntity[];
  private _teams: TeamEntity[];

  private _settings: CompetitionSettings;

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
    this._settings = plain.settings;
    this._rounds = plain.rounds.map((pl) => RoundEntity.load(pl));
    this._teams = plain.teams.map((pl) => TeamEntity.load(pl));
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
      ApiError.throw(CompetitionErrors.INVALID_DATES);

    if (
      (plain.name && plain.name.trim().length == 0) ||
      (plain.name && plain.name.trim().length > 255)
    )
      ApiError.throw(CompetitionErrors.NAME_LENGTH_RESTRICTION);

    if (
      (plain.description && plain.description.trim().length == 0) ||
      (plain.description && plain.description.trim().length > 1000)
    )
      ApiError.throw(CompetitionErrors.DESCRIPTION_LENGTH_RESTRICTION);
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
      plain.status != CompetitionStatus.DRAFT &&
      !(plain.rules.length > 0 && filledIn)
    )
      ApiError.throw(CompetitionErrors.LOAD_FROM_DB_FAILED, plain.id);

    return new CompetitionEntity(plain);
  }

  public static create(plain: ICreateCompetition) {
    CompetitionEntity.validate(plain);
    return new CompetitionEntity({
      ...plain,
      id: randomUUID(),
      rules: plain.rules || [],
      status: CompetitionStatus.DRAFT,
      settings: CompetitionSettings.createDefaults(),
      rounds: [],
      teams: [],
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
        CompetitionStatus.ARCHIVED,
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
    if (!this.canBeChanged)
      ApiError.throw(CompetitionErrors.COMPETITION_IS_READONLY);
  }

  private static datesValid(
    publishAt: Date | undefined,
    startReg: Date | undefined,
    endReg: Date | undefined,
    start: Date | undefined,
    end: Date | undefined,
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
      ApiError.throw(CompetitionErrors.NAME_LENGTH_RESTRICTION);

    this._name = value.trim();
  }

  set description(value: string) {
    this.canChangeCheck();

    if (value.trim().length == 0 || value.trim().length > 1000)
      ApiError.throw(CompetitionErrors.DESCRIPTION_LENGTH_RESTRICTION);

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
      ApiError.throw(CompetitionErrors.INVALID_DATES);

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
      ApiError.throw(CompetitionErrors.INVALID_DATES);

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
      ApiError.throw(CompetitionErrors.INVALID_DATES);

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
      ApiError.throw(CompetitionErrors.INVALID_DATES);

    this._dateOfEndRegistration = value;
  }

  public publish() {
    if (
      this.status == CompetitionStatus.SCHEDULED &&
      (this._publishAt?.getTime() || 0) < Date.now()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    if (!this.canChangeStatusTo(CompetitionStatus.PUBLISHED))
      ApiError.throw(
        CompetitionErrors.STATUS_FLOW_BREAKS,
        `Change from ${this.status} to ${CompetitionStatus.PUBLISHED}`,
      );

    const showRoundsOneByOne = this.settings.get('showRoundsOneByOne');
    if (showRoundsOneByOne) {
      this._rounds.forEach((el, i) => {
        if (i == 0) return;
        el.hide();
      });
    }

    this.status = CompetitionStatus.PUBLISHED;
  }

  public showNextRound() {
    if (this.status != CompetitionStatus.STARTED)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    const haveActive = this._rounds.some(
      (a) => a.status == RoundStatus.IN_PROGRESS,
    );
    const nextRoundIndex = this._rounds.findIndex(
      (a) => a.status == RoundStatus.CREATED,
    );

    if (nextRoundIndex == -1 || haveActive)
      ApiError.throw(DomainErrors.UNEXPECTED_VALUE);

    this._rounds[nextRoundIndex].show();
  }

  public startRegistration() {
    if (
      !this.canChangeStatusTo(CompetitionStatus.REGISTRATION) ||
      this.dateOfStartRegistration!.getTime() < Date.now()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this.addEvent(new CompetitionRegistrationStarted(this));
    this.status = CompetitionStatus.REGISTRATION;
  }
  public endRegistration() {
    if (
      !this.canChangeStatusTo(CompetitionStatus.WAITING_FOR_START) ||
      this.dateOfEndRegistration!.getTime() < Date.now()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this.addEvent(new CompetitionRegistrationEnded(this));
    this.status = CompetitionStatus.WAITING_FOR_START;
  }
  public start() {
    if (
      !this.canChangeStatusTo(CompetitionStatus.STARTED) ||
      this.dateOfStart!.getTime() < Date.now()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this.addEvent(new CompetitionStarted(this));
    this.status = CompetitionStatus.STARTED;
  }
  public end() {
    if (
      !this.canChangeStatusTo(CompetitionStatus.ARCHIVED) ||
      this.dateOfEnd!.getTime() < Date.now()
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this.addEvent(new CompetitionFinished(this));
    this.status = CompetitionStatus.ARCHIVED;
  }

  public schedule(date: Date) {
    this.canChangeCheck();

    if (!this.canChangeStatusTo(CompetitionStatus.SCHEDULED))
      ApiError.throw(
        CompetitionErrors.STATUS_FLOW_BREAKS,
        `Change from ${this.status} to ${CompetitionStatus.SCHEDULED}`,
      );

    if (
      !CompetitionEntity.datesValid(
        date,
        this._dateOfStartRegistration,
        this._dateOfEndRegistration,
        this._dateOfStart,
        this._dateOfEnd,
      )
    )
      ApiError.throw(CompetitionErrors.INVALID_DATES);

    this._status = CompetitionStatus.SCHEDULED;
    this._publishAt = date;
  }

  public declineScheduledPublish() {
    if (!this.canChangeStatusTo(CompetitionStatus.DRAFT))
      ApiError.throw(
        CompetitionErrors.STATUS_FLOW_BREAKS,
        `Change from ${this.status} to ${CompetitionStatus.DRAFT}`,
      );

    this._status = CompetitionStatus.DRAFT;
    this._publishAt = undefined;
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
  set settings(value: CompetitionSettings | null) {
    this.canChangeCheck();
    if (!value) {
      this._settings = CompetitionSettings.createDefaults();
      return;
    }
    this._settings = value;
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
    if (i == -1)
      ApiError.throw(CompetitionErrors.ROUND_UNDEFINED_IN_COMPETITION);
    this._rounds.splice(i, 1);
  }

  public canAddTeam(team: TeamEntity) {
    const maxTeamSize = this.settings.get('maxTeamMembers');
    const minTeamSize = this.settings.get('minTeamMembers');

    if (team.members.length > maxTeamSize || team.members.length < minTeamSize)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    const maxTeams = this.settings.get('maxTeams');
    if (maxTeams < this.teams.length + 1)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    if (this.status != CompetitionStatus.REGISTRATION)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
  }

  public addTeam(team: TeamEntity) {
    this.canAddTeam(team);

    this._teams.push(team);
  }

  set status(value: CompetitionStatus) {
    if (value == CompetitionStatus.SCHEDULED)
      ApiError.throw(CompetitionErrors.SETTER_SCHEDULED);
    if (!this.canChangeStatusTo(value))
      ApiError.throw(
        CompetitionErrors.STATUS_FLOW_BREAKS,
        `Change from ${this.status} to ${value}`,
      );
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
  get publishAt(): Date | undefined {
    return this._publishAt;
  }
  get status() {
    return this._status;
  }
  get rules() {
    return [...this._rules];
  }
  get settings(): CompetitionSettings {
    return this._settings;
  }

  get rounds() {
    return [...this._rounds];
  }
  get teams() {
    return [...this._teams];
  }

  get canBeDeleted() {
    return this.canBeChanged;
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

  toJSON(): ICompetitionPlain {
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
      settings: this._settings,
      rounds: this.rounds,
      teams: this.teams.map((ent) => ent.toJSON()),
    };
  }
}
