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

export interface ITeamPlain {
  id: string;
  name: string;
  avatar: InternalFile;
  banner: InternalFile;
  members: string[];
  captain: string;
  inCompetition: boolean;
  activeCompetition?: string;
  history: {
    placeInLeaderboard: number;
    round: string;
  }[];
  memberInvites: {
    member: string;
    forCompetition: boolean;
    competition?: string;
    accepted: boolean;
  }[];
}

interface ITeamCreate {
  captain: string;
  name: string;
  avatar: InternalFile;
  banner: InternalFile;
}

export class TeamEntity extends Entity {
  public readonly id: string;
  private _name: string;
  private _avatar: InternalFile;
  private _banner: InternalFile;
  private _members: string[]; // uuids
  private _captain: string; // uuid
  private _inCompetition: boolean;
  private _activeCompetition?: string; // uuid
  private _history: {
    // should be the Valueable Object
    placeInLeaderboard: number;
    round: string; // uuid
  }[];

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
    this._inCompetition = plain.inCompetition;
    this._activeCompetition = plain.activeCompetition;
    this._history = plain.history;
    this._memberInvites = plain.memberInvites;
  }

  static create(createData: ITeamCreate) {
    return new TeamEntity({
      id: randomUUID(),
      captain: createData.captain,
      members: [createData.captain],
      activeCompetition: undefined,
      inCompetition: false,
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
  haveMember(uuid: string) {
    return this.members.includes(uuid);
  }
  get activeCompetition(): string | undefined {
    return this._activeCompetition;
  }
  get isInCompetition() {
    return this._inCompetition;
  }
  get history() {
    return [...this._history];
  }
  get invites() {
    return [...this._memberInvites];
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

  addMember(uuid: string) {
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
    if (!this.isCaptain(actor)) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);

    const target_idx = this.members.findIndex((a) => a == target);
    if (target_idx == -1) ApiError.throw(DomainErrors.NO_CHANGE);

    this._members.splice(target_idx, 1);

    this.addEvent(new MemberDeletedEvent({ memberId: target, team: this }));
  }
  changeCaptain(actor: string, target: string) {
    if (!this.isCaptain(actor)) ApiError.throw(DomainErrors.RESTRICTED_CHANGE);
    this._captain = target;

    this.addEvent(new CaptainChangedEvent({ captainId: target, team: this }));
  }
  addHistoryNode() {} // I will make V_OBJ for this in future. SO DON'T TOUCH THIS!
  inviteMembersForCompetition(competition: string, target: string) {
    if (!this.haveMember(target)) ApiError.throw(DomainErrors.NO_CHANGE);

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
  battle() {} // triggers when all users are accepted invites for competition and competition is valid, registred
  battleEnded() {} // triggers when team exit from competition

  toJSON(): ITeamPlain {
    return {
      id: this.id,
      name: this._name,
      avatar: this._avatar,
      banner: this._banner,
      activeCompetition: this._activeCompetition,
      captain: this._captain,
      members: this._members,
      history: this._history,
      inCompetition: this._inCompetition,
      memberInvites: this._memberInvites,
    };
  }
}
