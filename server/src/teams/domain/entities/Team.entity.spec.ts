// src/teams/domain/entities/Team.entity.spec.ts

import { randomUUID } from 'crypto';
import { ICreateTeam, TeamEntity } from './Team.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { TeamStatus } from 'src/types/TeamStatus';
import { ApiError, DomainErrors } from 'src/error/ApiError';

describe('TeamEntity', () => {
  let team: TeamEntity;

  beforeEach(() => {
    const createData: ICreateTeam = {
      captain: randomUUID(),
      name: 'Test Team',
      avatar: InternalFile.define<'team:avatar'>(
        'test-avatar-url',
        'team:avatar',
        'team:avatar',
      ),
      banner: InternalFile.define<'team:banner'>(
        'test-banner-url',
        'team:banner',
        'team:banner',
      ),
    };

    team = TeamEntity.create(createData);
  });

  it('should create a new team entity with the correct initial state', () => {
    expect(team.name).toBe('Test Team');
    expect(team.captain).toBeDefined();
    expect(team.members.length).toBe(1);
    expect(team.status).toBe(TeamStatus.IDLE);
    expect(team.avatar.url).toBe('test-avatar-url');
    expect(team.banner.url).toBe('test-banner-url');
  });

  it('should change the status of a team entity correctly', () => {
    team.status = TeamStatus.REGISTRATION;
    expect(team.status).toBe(TeamStatus.REGISTRATION);

    try {
      team.status = TeamStatus.ACTIVE;
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(DomainErrors.RESTRICTED_CHANGE);
    }
  });

  it('should add a member to the team entity correctly', () => {
    const newMemberId = randomUUID();
    team.inviteMember(newMemberId);
    team.acceptInvite(newMemberId);
    team.addMember(newMemberId);

    expect(team.members.length).toBe(2);
    expect(team.members.includes(newMemberId)).toBe(true);
  });

  it('should throw an error when adding a member without proper invitation', () => {
    const newMemberId = randomUUID();

    try {
      team.addMember(newMemberId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(DomainErrors.RESTRICTED_CHANGE);
    }
  });

  it('should delete a member from the team entity correctly', () => {
    const newMemberId = randomUUID();
    team.inviteMember(newMemberId);
    team.acceptInvite(newMemberId);
    team.addMember(newMemberId);

    team.deleteMember(team.captain, newMemberId);

    expect(team.members.length).toBe(1);
    expect(team.members.includes(newMemberId)).toBe(false);
  });

  it('should throw an error when deleting a member without proper captain permission', () => {
    const newMemberId = randomUUID();
    team.inviteMember(newMemberId);
    team.acceptInvite(newMemberId);

    try {
      team.deleteMember(randomUUID(), newMemberId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(DomainErrors.RESTRICTED_CHANGE);
    }
  });

  it('should change the captain of the team entity correctly', () => {
    const newCaptainId = randomUUID();
    team.inviteMember(newCaptainId);
    team.acceptInvite(newCaptainId);

    team.changeCaptain(team.captain, newCaptainId);

    expect(team.captain).toBe(newCaptainId);
  });

  it('should throw an error when changing the captain without proper permission', () => {
    const newCaptainId = randomUUID();
    team.inviteMember(newCaptainId);
    team.acceptInvite(newCaptainId);

    try {
      team.changeCaptain(randomUUID(), newCaptainId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(DomainErrors.RESTRICTED_CHANGE);
    }
  });

  it('should invite a member for a competition correctly', () => {
    const newMemberId = randomUUID();
    team.inviteMember(newMemberId);
    team.acceptInvite(newMemberId);
    team.addMember(newMemberId);

    console.log(team);

    const competitionId = randomUUID();
    team.startRegistration(competitionId);

    team.inviteMembersForCompetition(randomUUID(), newMemberId);

    expect(team.invites.length).toBe(3);
    expect(team.invites[0].forCompetition).toBe(true);
  });

  it('should start registration for a competition correctly', () => {
    const competitionId = randomUUID();
    team.startRegistration(competitionId);

    expect(team.status).toBe(TeamStatus.REGISTRATION);
    expect(team.activeCompetition).toBe(competitionId);
    expect(team.registrationTimeout).toBeDefined();
  });

  it('should cancel registration for a competition correctly', () => {
    const competitionId = randomUUID();
    team.startRegistration(competitionId);

    team.cancelRegistration(team.captain);

    expect(team.status).toBe(TeamStatus.IDLE);
    expect(team.invites.length).toBe(0);
    expect(team.registrationTimeout).toBeUndefined();
  });

  it('should throw an error when ending registration with incomplete invites', () => {
    const competitionId = randomUUID();
    team.startRegistration(competitionId);

    try {
      team.endRegistration();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(DomainErrors.RESTRICTED_CHANGE);
    }
  });
});
