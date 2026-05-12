import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';
import { UserController } from './user.controller';

// ------------------ mocks ------------------

const getPublicProfileQueryMock = { execute: jest.fn() };
const getPrivateProfileQueryMock = { execute: jest.fn() };
const updateAdditionalDataMock = { execute: jest.fn() };
const updateUsernameMock = { execute: jest.fn() };
const updateAvatarMock = { execute: jest.fn() };
const setRoleMock = { execute: jest.fn() };
const getUsersByEmailMock = { execute: jest.fn() };

// ------------------ configurable auth state ------------------

let currentRole = RoleEnum.ADMIN;
let currentUserId = 'user-id';

// ------------------ global guard mocks ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = currentUserId;
    req['user_role'] = currentRole;

    return true;
  }
}

class MockRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    return req['user_role'] === RoleEnum.ADMIN;
  }
}

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CommandTokens.GetPublicProfileQuery,
          useValue: getPublicProfileQueryMock,
        },
        {
          provide: CommandTokens.GetPrivateProfileQuery,
          useValue: getPrivateProfileQueryMock,
        },
        {
          provide: CommandTokens.UpdateUserAdditionalDataCommand,
          useValue: updateAdditionalDataMock,
        },
        {
          provide: CommandTokens.UpdateUsernameCommand,
          useValue: updateUsernameMock,
        },
        {
          provide: CommandTokens.UpdateAvatarCommand,
          useValue: updateAvatarMock,
        },
        {
          provide: CommandTokens.SetRoleToAUserCommand,
          useValue: setRoleMock,
        },
        {
          provide: CommandTokens.GetUsersByEmailQuery,
          useValue: getUsersByEmailMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalGuards(new MockAuthGuard(), new MockRoleGuard());

    await app.init();
  });

  beforeEach(() => {
    currentRole = RoleEnum.ADMIN;
    currentUserId = 'user-id';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------ GET /user/me ------------------

  it('GET /user/me returns private profile', async () => {
    getPrivateProfileQueryMock.execute.mockResolvedValue({
      id: 'user-id',
    });

    const res = await request(app.getHttpServer()).get('/user/me').expect(200);

    expect(res.body).toEqual({ id: 'user-id' });

    expect(getPrivateProfileQueryMock.execute).toHaveBeenCalledWith('user-id');
  });

  // ------------------ GET /user/public ------------------

  it('GET /user/public returns public profile', async () => {
    getPublicProfileQueryMock.execute.mockResolvedValue({
      id: 'target-id',
    });

    const res = await request(app.getHttpServer())
      .get('/user/public?id=target-id')
      .expect(200);

    expect(res.body).toEqual({ id: 'target-id' });

    expect(getPublicProfileQueryMock.execute).toHaveBeenCalledWith('target-id');
  });

  it('GET /user/public fails without id', async () => {
    await request(app.getHttpServer()).get('/user/public').expect(500);
  });

  // ------------------ GET /user/users/:page ------------------

  it('GET /user/users/:page returns users page', async () => {
    getUsersByEmailMock.execute.mockResolvedValue({
      data: [],
      page: 1,
    });

    const res = await request(app.getHttpServer())
      .get('/user/users/1?email=test@mail.com')
      .expect(200);

    expect(res.body).toEqual({
      data: [],
      page: 1,
    });

    expect(getUsersByEmailMock.execute).toHaveBeenCalledWith({
      page: '1',
      email: 'test@mail.com',
    });
  });

  it('GET /user/users/:page fails if not admin', async () => {
    currentRole = RoleEnum.USER;

    await request(app.getHttpServer()).get('/user/users/1').expect(403);
  });

  // ------------------ PATCH /user/additional ------------------

  it('PATCH /user/additional updates additional data', async () => {
    await request(app.getHttpServer())
      .patch('/user/additional')
      .send({ bio: 'hello' })
      .expect(200);

    expect(updateAdditionalDataMock.execute).toHaveBeenCalledWith({
      data: { bio: 'hello' },
      id: 'user-id',
    });
  });

  // ------------------ PATCH /user/username ------------------

  it('PATCH /user/username updates username', async () => {
    await request(app.getHttpServer())
      .patch('/user/username')
      .send({ username: 'newname' })
      .expect(200);

    expect(updateUsernameMock.execute).toHaveBeenCalledWith({
      username: 'newname',
      id: 'user-id',
    });
  });

  // ------------------ PATCH /user/avatar ------------------

  it('PATCH /user/avatar updates avatar', async () => {
    await request(app.getHttpServer())
      .patch('/user/avatar')
      .send({ avatar: 'url' })
      .expect(200);

    expect(updateAvatarMock.execute).toHaveBeenCalledWith({
      avatar: 'url',
      id: 'user-id',
    });
  });

  // ------------------ PATCH /user/role ------------------

  it('PATCH /user/role updates role (admin)', async () => {
    setRoleMock.execute.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .patch('/user/role')
      .send({
        userId: 'user-id',
        role: RoleEnum.ADMIN,
      })
      .expect(200);

    expect(res.body).toEqual({ success: true });

    expect(setRoleMock.execute).toHaveBeenCalledWith({
      actor: 'user-id',
      role: RoleEnum.ADMIN,
      userToChangeId: 'user-id',
    });
  });
});
