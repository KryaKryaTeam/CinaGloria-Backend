import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { CommandTokens } from 'src/common/Tokens';
import { NotificationsController } from './NotificationsController';

// ------------------ mocks ------------------

const getNotificationsMock = { execute: jest.fn() };
const makeReadMock = { execute: jest.fn() };
const markAllReadMock = { execute: jest.fn() };

// ------------------ auth mock ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = 'user-id';
    req['user_role'] = 'ADMIN';

    return true;
  }
}

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: CommandTokens.GetNotificationsQuery,
          useValue: getNotificationsMock,
        },
        {
          provide: CommandTokens.MakeNotificationReadCommand,
          useValue: makeReadMock,
        },
        {
          provide: CommandTokens.MarkAllNotificationsReadCommand,
          useValue: markAllReadMock,
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

  // ------------------ GET PAGE ------------------

  it('GET /notification/:page returns notifications', async () => {
    getNotificationsMock.execute.mockResolvedValue({
      items: [{ id: 'n1' }],
    });

    const res = await request(app.getHttpServer())
      .get('/notification/1')
      .expect(200);

    expect(res.body).toEqual({
      items: [{ id: 'n1' }],
    });

    expect(getNotificationsMock.execute).toHaveBeenCalledWith({
      page: '1',
      id: 'user-id',
    });
  });

  // ------------------ MARK ONE READ ------------------

  it('PUT /notification/one/:notificationId marks one as read', async () => {
    makeReadMock.execute.mockResolvedValue(undefined);

    const res = await request(app.getHttpServer())
      .put('/notification/one/n-1')
      .expect(200);

    expect(res.body).toEqual({
      notificationId: 'n-1',
    });

    expect(makeReadMock.execute).toHaveBeenCalledWith({
      notificationId: 'n-1',
      user: 'user-id',
    });
  });

  // ------------------ MARK ALL READ ------------------

  it('PUT /notification/all marks all as read', async () => {
    markAllReadMock.execute.mockResolvedValue(undefined);

    await request(app.getHttpServer()).put('/notification/all').expect(200);

    expect(markAllReadMock.execute).toHaveBeenCalledWith({
      user: 'user-id',
    });
  });
});
