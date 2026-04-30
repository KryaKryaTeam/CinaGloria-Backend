import { randomUUID } from 'crypto';
import { Entity } from 'src/common/domain/Entity';
import { ApiError, DomainErrors } from 'src/error/ApiError';
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
}

export interface ITeamCreate {
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
  }

  static create(createData: ITeamCreate) {
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
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
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

  // methods

  set status(newStatus: TeamStatus) {
    const avalibleTransitions: TeamStatus[] = {
      [TeamStatus.IDLE]: [TeamStatus.REGISTRATION],
      [TeamStatus.REGISTRATION]: [TeamStatus.IDLE, TeamStatus.ACTIVE],
      [TeamStatus.ACTIVE]: [TeamStatus.IDLE],
    }[this.status];

    if (!avalibleTransitions.includes(newStatus))
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this._status = newStatus;
  }

  addMember(uuid: string) {
    this.canMakeMemberChangesCheck();
    if (!(this.userHasMemberInvite(uuid) && this.userIsAcceptInvite(uuid)))
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this._members.push(uuid);

    this._memberInvites.splice(
      this._memberInvites.findIndex((a) => a.accepted && a.member == uuid),
      1,
    );

    this.addEvent(new MemberAddedEvent({ memberId: uuid, team: this }));
  }
  inviteMember(uuid: string) {
    this.canMakeMemberChangesCheck();
    if (this.userHasMemberInvite(uuid))
      ApiError.throw(DomainErrors.DUPLICATION);

    this._memberInvites.push({
      member: uuid,
      forCompetition: false,
      accepted: false,
    });

    this.addEvent(new MemberInvitedEvent({ userId: uuid, team: this }));
  }
  deleteMember(actor: string, target: string) {
    this.canMakeMemberChangesCheck();
    if (!this.isCaptain(actor)) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    const target_idx = this._members.findIndex((a) => a == target);
    if (target_idx == -1) ApiError.throw(DomainErrors.NO_CHANGE);

    this._members.splice(target_idx, 1);

    this.addEvent(new MemberDeletedEvent({ memberId: target, team: this }));
  }
  changeCaptain(actor: string, target: string) {
    this.canMakeMemberChangesCheck();
    if (!this.isCaptain(actor)) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
    this._captain = target;

    this.addEvent(new CaptainChangedEvent({ captainId: target, team: this }));
  }

  inviteMembersForCompetition(competition: string, target: string) {
    if (!this.haveMember(target)) ApiError.throw(DomainErrors.NO_CHANGE);
    if (this.status != TeamStatus.REGISTRATION)
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

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
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    const invite_idx = this._memberInvites.findIndex(
      (a) => a.member == uuid && !a.accepted,
    );

    if (invite_idx == -1) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

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
    // must be called in the service to be sure that team is okay for competition settings
    const noInvites = this.invites.length == 0;
    if (!noInvites) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    this.status = TeamStatus.REGISTRATION;
    this._activeCompetition = competitionId;
    this._registrationTimeout = new Date(Date.now() + 3600000);

    this._members.forEach((member) => {
      this.inviteMembersForCompetition(competitionId, member);
    });
  }
  cancelRegistration(actor: string, system?: boolean) {
    if (
      (!this.isCaptain(actor) || this.status != TeamStatus.REGISTRATION) &&
      !system
    )
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

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
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
    if (
      this._registrationTimeout.getTime() >= Date.now() &&
      !this.allIsAccepted()
    ) {
      this.cancelRegistration('', true);
      ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
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
  } // I will make V_OBJ for this in future. SO DON'T TOUCH THIS!
  //generateCert() {} <--- futured functionality

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
    };
  }
}
