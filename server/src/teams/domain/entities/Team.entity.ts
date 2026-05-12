import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { ApiError, DomainErrors, TeamErrors } from 'src/error/ApiError';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { MemberAddedEvent } from '../events/MemberAdded.event';
import { MemberInvitedEvent } from '../events/MemberInvited.event';
import { MemberDeletedEvent } from '../events/MemberDeleted.event';
import { MemberInvitedForCompetitionEvent } from '../events/MemberInvitedForCompetition.event';
import { CaptainChangedEvent } from '../events/CaptainChanged.event';
import { MemberAcceptedInviteForCompetitionEvent } from '../events/MemberAcceptedInviteForCompetition.event';
import { MemberAcceptedInviteEvent } from '../events/MemberAcceptedInvite.event';
import {
  ITeamHistoryPlain,
  TeamHistoryObject,
} from '../objects/TeamHistoryNode.object';
import { TeamRegistartionEndedEvent } from '../events/TeamRegistartionEnded.event';
import { TeamRegistarationCanceledEvent } from '../events/TeamRegistarationCanceled.event';
import { TeamStatus } from 'src/types/TeamStatus';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

export interface ITeamPlain {
  id: string;
  name: string;
  avatar: InternalFile<'team:avatar'>;
  banner: InternalFile<'team:banner'>;
  members: string[];
  captain: string;
  status: TeamStatus;
  activeCompetition?: string;
  registrationTimeout?: Date;
  history: ITeamHistoryPlain[];
  memberInvites: {
    member: string;
    forCompetition: boolean;
    competition?: string;
    accepted: boolean;
  }[];
  round: RoundEntity | undefined;
}

export interface ICreateTeam {
  captain: string;
  name: string;
  avatar: InternalFile<'team:avatar'>;
  banner: InternalFile<'team:banner'>;
}

export class TeamEntity extends Entity {
  public readonly id: string;
  private _name: string;
  private _avatar: InternalFile<'team:avatar'>;
  private _banner: InternalFile<'team:banner'>;
  private _members: string[]; // uuids
  private _captain: string; // uuid
  private _status: TeamStatus;
  private _activeCompetition?: string; // uuid
  private _registrationTimeout?: Date; // now + 1 hour
  private _history: TeamHistoryObject[];
  private _round: RoundEntity | undefined;

  // invites
  private _memberInvites: {
    // should be the Valueable Object
    member: string; // uuid
    forCompetition: boolean;
    competition?: string; // uuid
    accepted: boolean;
  }[];

  private constructor(plain: ITeamPlain) {
    super();
    this.id = plain.id;
    this._name = plain.name;
    this._avatar = plain.avatar;
    this._banner = plain.banner;
    this._members = plain.members;
    this._captain = plain.captain;
    this._activeCompetition = plain.activeCompetition;
    this._history = plain.history.map((plain) =>
      TeamHistoryObject.define(plain),
    );
    this._memberInvites = plain.memberInvites;
    this._status = plain.status;
    this._registrationTimeout = plain.registrationTimeout;
    this._round = plain.round;
  }

  static create(createData: ICreateTeam) {
    return new TeamEntity({
      id: randomUUID(),
      captain: createData.captain,
      members: [createData.captain],
      activeCompetition: undefined,
      status: TeamStatus.IDLE,
      avatar: createData.avatar,
      banner: createData.banner,
      history: [],
      memberInvites: [],
      name: createData.name,
      round: undefined,
    });
  }

  static createFake(captain?: string) {
    const captain_ = captain ?? randomUUID();
    return new TeamEntity({
      id: randomUUID(),
      captain: captain_,
      members: [captain_],
      activeCompetition: undefined,
      status: TeamStatus.IDLE,
      avatar: InternalFile.define<'team:avatar'>(
        randomUUID() + '.webp',
        'team:avatar',
        'team:avatar',
      ),
      banner: InternalFile.define<'team:banner'>(
        randomUUID() + '.webp',
        'team:banner',
        'team:banner',
      ),
      history: [],
      memberInvites: [],
      name: 'Team B',
      round: undefined,
    });
  }

  static load(plain: ITeamPlain) {
    return new TeamEntity(plain);
  }

  get name() {
    return this._name;
  }
  get captain() {
    return this._captain;
  }
  isCaptain(uuid: string) {
    return this.captain == uuid;
  }
  get members() {
    return [...this._members];
  }
  canMakeMemberChangesCheck() {
    if (this._status != TeamStatus.IDLE)
      ApiError.throw(TeamErrors.RESTRICTED_CHANGE);
  }
  haveMember(uuid: string) {
    return this.members.includes(uuid);
  }
  get activeCompetition(): string | undefined {
    return this._activeCompetition;
  }
  get status() {
    return this._status;
  }
  get history() {
    return [...this._history];
  }
  get invites() {
    return [...this._memberInvites];
  }
  get avatar(): InternalFile<'team:avatar'> {
    return this._avatar;
  }
  get banner(): InternalFile<'team:banner'> {
    return this._banner;
  }
  get registrationTimeout() {
    return this._registrationTimeout;
  }
  userIsAcceptInvite(uuid: string) {
    return (
      this._memberInvites.findIndex((a) => a.member == uuid && a.accepted) != -1
    );
  }
  userHasMemberInvite(uuid: string) {
    return (
      this._memberInvites.findIndex(
        (a) => a.member == uuid && a.forCompetition == false,
      ) != -1
    );
  }
  userHasCompetitionInvite(uuid: string) {
    return (
      this._memberInvites.findIndex(
        (a) => a.member == uuid && a.forCompetition == true,
      ) != -1
    );
  }

  get round(): RoundEntity | undefined {
    return this._round;
  }

  // methods

  set status(newStatus: TeamStatus) {
    const avalibleTransitions: TeamStatus[] = {
      [TeamStatus.IDLE]: [TeamStatus.REGISTRATION],
      [TeamStatus.REGISTRATION]: [TeamStatus.IDLE, TeamStatus.ACTIVE],
      [TeamStatus.ACTIVE]: [TeamStatus.IDLE],
    }[this.status];

    if (!avalibleTransitions.includes(newStatus))
      ApiError.throw(TeamErrors.STATUS_FLOW_BREAK);

    this._status = newStatus;
  }

  addMember(uuid: string) {
    this.canMakeMemberChangesCheck();
    if (!(this.userHasMemberInvite(uuid) && this.userIsAcceptInvite(uuid)))
      ApiError.throw(TeamErrors.MEMBER_MUST_ACCEPT_INVITE);

    this._members.push(uuid);

    this._memberInvites.splice(
      this._memberInvites.findIndex((a) => a.accepted && a.member == uuid),
      1,
    );

    this.addEvent(new MemberAddedEvent({ memberId: uuid, team: this }));
  }
  inviteMember(uuid: string) {
    this.canMakeMemberChangesCheck();
    if (this.userHasMemberInvite(uuid) || this.haveMember(uuid))
      ApiError.throw(TeamErrors.USER_ALREADY_MEMBER_OR_INVITED);

    this._memberInvites.push({
      member: uuid,
      forCompetition: false,
      accepted: false,
    });

    this.addEvent(new MemberInvitedEvent({ userId: uuid, team: this }));
  }
  deleteMember(target: string) {
    this.canMakeMemberChangesCheck();

    const target_idx = this._members.findIndex((a) => a == target);
    if (target_idx == -1) ApiError.throw(TeamErrors.MEMBER_UNDEFINED);

    this._members.splice(target_idx, 1);

    this.addEvent(new MemberDeletedEvent({ memberId: target, team: this }));
  }
  changeCaptain(target: string) {
    this.canMakeMemberChangesCheck();
    this._captain = target;

    this.addEvent(new CaptainChangedEvent({ captainId: target, team: this }));
  }

  inviteMembersForCompetition(competition: string, target: string) {
    if (!this.haveMember(target)) ApiError.throw(TeamErrors.MEMBER_UNDEFINED);
    if (this.status != TeamStatus.REGISTRATION)
      ApiError.throw(TeamErrors.REGISTRATION_REQUIRED_FOR_INVITE);

    this._memberInvites.push({
      member: target,
      accepted: false,
      forCompetition: true,
      competition: competition,
    });

    this.addEvent(
      new MemberInvitedForCompetitionEvent({
        competitionId: competition,
        team: this,
        memberId: target,
      }),
    );
  }
  acceptInvite(uuid: string) {
    if (
      (!this.userHasCompetitionInvite(uuid) &&
        !this.userHasMemberInvite(uuid)) ||
      this.userIsAcceptInvite(uuid)
    )
      ApiError.throw(TeamErrors.NO_INVITES_FOUND);

    const invite_idx = this._memberInvites.findIndex(
      (a) => a.member == uuid && !a.accepted,
    );

    if (invite_idx == -1) ApiError.throw(TeamErrors.NO_INVITES_FOUND);

    this._memberInvites[invite_idx].accepted = true;

    if (this._memberInvites[invite_idx].forCompetition)
      this.addEvent(
        new MemberAcceptedInviteForCompetitionEvent({
          memberId: uuid,
          team: this,
        }),
      );
    else
      this.addEvent(
        new MemberAcceptedInviteEvent({ memberId: uuid, team: this }),
      );
  }
  allIsAccepted() {
    return this._memberInvites.every((a) => a.accepted == true);
  }

  // registration for competition

  startRegistration(competitionId: string) {
    const noInvites = this.invites.length == 0;
    if (!noInvites) ApiError.throw(TeamErrors.PENDING_INVITES_EXIST);

    this.status = TeamStatus.REGISTRATION;
    this._activeCompetition = competitionId;
    this._registrationTimeout = new Date(Date.now() + 3600000);

    this._members.forEach((member) => {
      this.inviteMembersForCompetition(competitionId, member);
    });
  }
  cancelRegistration() {
    this.status = TeamStatus.IDLE;
    this._memberInvites = [];
    this._registrationTimeout = undefined;

    this.addEvent(
      new TeamRegistarationCanceledEvent({
        team: this,
        competitionId: this._activeCompetition!,
      }),
    );
  }
  endRegistration() {
    if (
      !this._registrationTimeout ||
      this.status != TeamStatus.REGISTRATION ||
      this._registrationTimeout.getTime() < Date.now()
    )
      ApiError.throw(TeamErrors.CANNOT_END_REGISTRATION);
    if (
      this._registrationTimeout.getTime() >= Date.now() &&
      !this.allIsAccepted()
    ) {
      this.cancelRegistration();
      ApiError.throw(TeamErrors.CANNOT_END_REGISTRATION);
    }

    this.status = TeamStatus.ACTIVE;
    this._registrationTimeout = undefined;
    this._memberInvites = [];

    this.addEvent(
      new TeamRegistartionEndedEvent({
        team: this,
        competitionId: this._activeCompetition!,
      }),
    );
  }

  // in competition status
  addHistoryNode(historyNode: TeamHistoryObject) {
    this._history.push(historyNode);
  }
  //generateCert() {} <--- futured functionality

  set name(new_: string) {
    if (new_.trim().length == 0 || new_.trim().length < 255)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
    this._name = new_.trim();
  }

  set avatar(new_: InternalFile<'team:avatar'>) {
    this._avatar = new_;
  }

  set banner(new_: InternalFile<'team:banner'>) {
    this._banner = new_;
  }

  set round(value: RoundEntity) {
    this._round = value;
  }

  toJSON(): ITeamPlain {
    return {
      id: this.id,
      name: this._name,
      avatar: this._avatar,
      banner: this._banner,
      activeCompetition: this._activeCompetition,
      captain: this._captain,
      members: this._members,
      history: this._history.map((node) => node.toJSON()),
      status: this._status,
      memberInvites: this._memberInvites,
      round: this._round,
    };
  }
}
