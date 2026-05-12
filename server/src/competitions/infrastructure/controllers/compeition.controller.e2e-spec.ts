import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { CompetitionController } from './competition.controller';
import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';

// ------------------ mocks ------------------

const createCompetitionMock = { execute: jest.fn() };
const deleteCompetitionMock = { execute: jest.fn() };
const getCompetitionPageMock = { execute: jest.fn() };
const getPublicCompetitionsPageMock = { execute: jest.fn() };
const getPublicCompetitionMock = { execute: jest.fn() };
const publishCompetitionMock = { execute: jest.fn() };
const scheduleCompetitionMock = { execute: jest.fn() };
const updateCompetitionMock = { execute: jest.fn() };
const declineScheduleMock = { execute: jest.fn() };
const updateSettingsMock = { execute: jest.fn() };

// ------------------ auth mock ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = 'user-id';
    req['user_role'] = RoleEnum.ADMIN;

    return true;
  }
}

class MockRoleGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    return req['user_role'] === RoleEnum.ADMIN;
  }
}

describe('CompetitionController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CompetitionController],
      providers: [
        {
          provide: CommandTokens.CreateCompetitionCommand,
          useValue: createCompetitionMock,
        },
        {
          provide: CommandTokens.DeleteCompetitionCommand,
          useValue: deleteCompetitionMock,
        },
        {
          provide: CommandTokens.GetCompetitionPageQuery,
          useValue: getCompetitionPageMock,
        },
        {
          provide: CommandTokens.GetPublicCompetitionsPageQuery,
          useValue: getPublicCompetitionsPageMock,
        },
        {
          provide: CommandTokens.GetPublicCompetitionQuery,
          useValue: getPublicCompetitionMock,
        },
        {
          provide: CommandTokens.PublishCompetitionCommand,
          useValue: publishCompetitionMock,
        },
        {
          provide: CommandTokens.ScheduleCompetitionPublishCommand,
          useValue: scheduleCompetitionMock,
        },
        {
          provide: CommandTokens.UpdateCompetitionCommand,
          useValue: updateCompetitionMock,
        },
        {
          provide: CommandTokens.DeclineScheduledPublishCommand,
          useValue: declineScheduleMock,
        },
        {
          provide: CommandTokens.UpdateSettingsOfCompetitionCommand,
          useValue: updateSettingsMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalGuards(new MockAuthGuard(), new MockRoleGuard());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------ PUBLIC ------------------

  it('GET /competition/public/page/:page returns public list', async () => {
    getPublicCompetitionsPageMock.execute.mockResolvedValue({
      competitions: [{ id: 'c1' }],
    });

    const res = await request(app.getHttpServer())
      .get('/competition/public/page/1')
      .expect(200);

    expect(res.body).toEqual([{ id: 'c1' }]);
  });

  it('GET /competition/public/single/:id returns competition', async () => {
    getPublicCompetitionMock.execute.mockResolvedValue({
      competition: { id: 'c1' },
    });

    const res = await request(app.getHttpServer())
      .get('/competition/public/single/c1')
      .expect(200);

    expect(res.body).toEqual({ id: 'c1' });
  });

  // ------------------ PRIVATE ------------------

  it('GET /competition/private/:page returns private competitions', async () => {
    getCompetitionPageMock.execute.mockResolvedValue({
      competitions: [{ id: 'c1' }],
    });

    const res = await request(app.getHttpServer())
      .get('/competition/private/1')
      .expect(200);

    expect(res.body).toEqual([{ id: 'c1' }]);

    expect(getCompetitionPageMock.execute).toHaveBeenCalledWith({
      page: '1',
      user: 'user-id',
    });
  });

  // ------------------ CREATE ------------------

  it('POST /competition/create creates competition', async () => {
    createCompetitionMock.execute.mockResolvedValue({ id: 'c1' });

    const res = await request(app.getHttpServer())
      .post('/competition/create')
      .send({ title: 'test competition' })
      .expect(201);

    expect(res.body).toEqual({ id: 'c1' });
  });

  // ------------------ DELETE ------------------

  it('DELETE /competition/delete/:id deletes competition', async () => {
    deleteCompetitionMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .delete('/competition/delete/c1')
      .expect(200);

    expect(res.body).toEqual({ success: true });
  });

  // ------------------ PUBLISH ------------------

  it('PUT /competition/publish/:id publishes competition', async () => {
    publishCompetitionMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .put('/competition/publish/c1')
      .expect(200);

    expect(res.body).toEqual({ success: true });
  });

  // ------------------ SETTINGS ------------------

  it('PATCH /competition/settings/:id updates settings', async () => {
    updateSettingsMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .patch('/competition/settings/c1')
      .send({ settings: { visibility: 'PUBLIC' } })
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(updateSettingsMock.execute).toHaveBeenCalledWith({
      competitionId: 'c1',
      user: 'user-id',
      settings: { visibility: 'PUBLIC' },
    });
  });
});
