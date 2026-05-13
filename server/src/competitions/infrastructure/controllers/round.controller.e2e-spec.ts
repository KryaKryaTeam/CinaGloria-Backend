import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { RoundController } from './round.controller';
import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';

// ------------------ mocks ------------------

const createRoundMock = { execute: jest.fn() };
const deleteRoundMock = { execute: jest.fn() };
const patchRoundMock = { execute: jest.fn() };

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

describe('RoundController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RoundController],
      providers: [
        {
          provide: CommandTokens.CreateRoundCommand,
          useValue: createRoundMock,
        },
        {
          provide: CommandTokens.DeleteRoundCommand,
          useValue: deleteRoundMock,
        },
        {
          provide: CommandTokens.PatchRoundCommand,
          useValue: patchRoundMock,
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

  // ------------------ CREATE ROUND ------------------

  it('POST /round/create creates round', async () => {
    createRoundMock.execute.mockResolvedValue({
      id: 'round-1',
    });

    const res = await request(app.getHttpServer())
      .post('/round/create')
      .send({
        competitionId: 'comp-1',
        round: { name: 'Round 1' },
      })
      .expect(201);

    expect(res.body).toEqual({
      id: 'round-1',
    });

    expect(createRoundMock.execute).toHaveBeenCalledWith({
      competitionId: 'comp-1',
      roundData: { name: 'Round 1' },
      user: 'user-id',
    });
  });

  // ------------------ DELETE ROUND ------------------

  it('POST /round/delete deletes round', async () => {
    deleteRoundMock.execute.mockResolvedValue({
      success: true,
    });

    const res = await request(app.getHttpServer())
      .post('/round/delete')
      .send({
        roundId: 'round-1',
      })
      .expect(201);

    expect(res.body).toEqual({
      success: true,
    });

    expect(deleteRoundMock.execute).toHaveBeenCalledWith({
      roundId: 'round-1',
    });
  });

  // ------------------ PATCH ROUND ------------------

  it('POST /round/patch patches round', async () => {
    patchRoundMock.execute.mockResolvedValue({
      success: true,
    });

    const res = await request(app.getHttpServer())
      .post('/round/patch')
      .send({
        roundId: 'round-1',
        name: 'Updated round',
      })
      .expect(201);

    expect(res.body).toEqual({
      success: true,
    });

    expect(patchRoundMock.execute).toHaveBeenCalledWith({
      roundId: 'round-1',
      name: 'Updated round',
      user: 'user-id',
    });
  });
});
