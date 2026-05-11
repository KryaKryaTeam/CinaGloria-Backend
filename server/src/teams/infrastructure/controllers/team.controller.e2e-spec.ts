import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { TeamController } from './team.controller';
import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';

// ------------------ mocks ------------------

const getMyTeamsMock = { execute: jest.fn() };
const createTeamMock = { execute: jest.fn() };
const patchTeamMock = { execute: jest.fn() };
const deleteTeamMock = { execute: jest.fn() };
const inviteMemberMock = { execute: jest.fn() };
const deleteMemberMock = { execute: jest.fn() };
const changeCaptainMock = { execute: jest.fn() };
const registerTeamMock = { execute: jest.fn() };
const cancelRegistrationMock = { execute: jest.fn() };

// ------------------ auth mock ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = 'user-id';
    req['user_role'] = RoleEnum.ADMIN;

    return true;
  }
}

describe('TeamController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: CommandTokens.GetMyTeamsPageQuery,
          useValue: getMyTeamsMock,
        },
        { provide: CommandTokens.CreateTeamCommand, useValue: createTeamMock },
        { provide: CommandTokens.PatchTeamCommand, useValue: patchTeamMock },
        { provide: CommandTokens.DeleteTeamCommand, useValue: deleteTeamMock },
        {
          provide: CommandTokens.InviteMemberCommand,
          useValue: inviteMemberMock,
        },
        {
          provide: CommandTokens.DeleteMemberCommand,
          useValue: deleteMemberMock,
        },
        {
          provide: CommandTokens.ChangeCaptainCommand,
          useValue: changeCaptainMock,
        },
        {
          provide: CommandTokens.RegisterTeamCommand,
          useValue: registerTeamMock,
        },
        {
          provide: CommandTokens.CancelRegistrationOfTeamsCommand,
          useValue: cancelRegistrationMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalGuards(new MockAuthGuard());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------ GET MY TEAMS ------------------

  it('GET /teams/me/:page returns user teams', async () => {
    getMyTeamsMock.execute.mockResolvedValue({
      teams: [{ id: 't1' }],
    });

    const res = await request(app.getHttpServer())
      .get('/teams/me/1')
      .expect(200);

    expect(res.body).toEqual({
      teams: [{ id: 't1' }],
    });

    expect(getMyTeamsMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      page: '1',
    });
  });

  // ------------------ CREATE TEAM ------------------

  it('POST /teams creates team', async () => {
    createTeamMock.execute.mockResolvedValue({
      team: { id: 'team-1' },
    });

    const res = await request(app.getHttpServer())
      .post('/teams')
      .send({ name: 'My Team' })
      .expect(201);

    expect(res.body).toEqual({ id: 'team-1' });

    expect(createTeamMock.execute).toHaveBeenCalled();
  });

  // ------------------ PATCH TEAM ------------------

  it('PATCH /teams/:teamId updates team', async () => {
    patchTeamMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .patch('/teams/t1')
      .send({ name: 'Updated' })
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(patchTeamMock.execute).toHaveBeenCalledWith({
      teamData: { name: 'Updated' },
      teamId: 't1',
      user: 'user-id',
    });
  });

  // ------------------ DELETE TEAM ------------------

  it('DELETE /teams/:teamId deletes team', async () => {
    deleteTeamMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .delete('/teams/t1')
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(deleteTeamMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      teamId: 't1',
    });
  });

  // ------------------ ADD MEMBER ------------------

  it('POST /teams/:teamId/members adds member', async () => {
    inviteMemberMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .post('/teams/t1/members')
      .send({ memberId: 'm1' })
      .expect(201);

    expect(res.body).toEqual({ success: true });

    expect(inviteMemberMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      target: 'm1',
      teamId: 't1',
    });
  });

  // ------------------ REMOVE MEMBER ------------------

  it('DELETE /teams/:teamId/members/:memberId removes member', async () => {
    deleteMemberMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .delete('/teams/t1/members/m1')
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(deleteMemberMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      teamId: 't1',
      targetId: 'm1',
    });
  });

  // ------------------ CHANGE CAPTAIN ------------------

  it('PATCH /teams/:teamId/captain changes captain', async () => {
    changeCaptainMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .patch('/teams/t1/captain')
      .send({ captain: 'u2' })
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(changeCaptainMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      target: 'u2',
      teamId: 't1',
    });
  });

  // ------------------ REGISTER TEAM ------------------

  it('POST /teams/:teamId/registration registers team', async () => {
    registerTeamMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .post('/teams/t1/registration')
      .send({ competitionId: 'c1' })
      .expect(201);

    expect(res.body).toEqual({ success: true });

    expect(registerTeamMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      competitionId: 'c1',
      teamId: 't1',
    });
  });

  // ------------------ CANCEL REGISTRATION ------------------

  it('DELETE /teams/:teamId/registration cancels registration', async () => {
    cancelRegistrationMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .delete('/teams/t1/registration')
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(cancelRegistrationMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      teamId: 't1',
    });
  });
});
