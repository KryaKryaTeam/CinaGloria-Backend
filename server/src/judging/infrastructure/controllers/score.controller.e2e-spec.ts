import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  Injectable,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ScoreController } from './score.controller';

import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';

@Injectable()
class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    request.user = {
      id: 'test-user-id',
      role: request.headers.role,
    };

    return true;
  }
}

@Injectable()
class FakeRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user.role !== RoleEnum.JUDGE) {
      throw new ForbiddenException();
    }

    return true;
  }
}

describe('ScoreController (e2e)', () => {
  let app: INestApplication;

  const createScoreCommandMock = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        {
          provide: CommandTokens.CreateScoreCommand,
          useValue: createScoreCommandMock,
        },

        {
          provide: APP_GUARD,
          useClass: FakeAuthGuard,
        },

        {
          provide: APP_GUARD,
          useClass: FakeRoleGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/score/create should create a score for judge', async () => {
    createScoreCommandMock.execute.mockResolvedValue(undefined);

    const dto = {
      score: 10,
      team: 'c92a5877-1c8c-4ed1-85f4-14388acdba53',
      task: 'd92a5877-1c8c-4ed1-85f4-14388acdba54',
    };

    await request(app.getHttpServer())
      .post('/v1/score/create')
      .set('role', RoleEnum.JUDGE)
      .send(dto)
      .expect(201);

    expect(createScoreCommandMock.execute).toHaveBeenCalledTimes(1);

    expect(createScoreCommandMock.execute).toHaveBeenCalledWith(dto);
  });

  it('POST /v1/score/create should fail for non-judge', async () => {
    const dto = {
      score: 10,
      team: 'c92a5877-1c8c-4ed1-85f4-14388acdba53',
      task: 'd92a5877-1c8c-4ed1-85f4-14388acdba54',
    };

    await request(app.getHttpServer())
      .post('/v1/score/create')
      .set('role', RoleEnum.ADMIN)
      .send(dto)
      .expect(403);

    expect(createScoreCommandMock.execute).not.toHaveBeenCalled();
  });
});
