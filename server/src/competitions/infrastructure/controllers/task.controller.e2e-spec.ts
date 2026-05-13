import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { TaskController } from './task.controller';
import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';

// ------------------ mock ------------------

const createTaskMock = { execute: jest.fn() };

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

describe('TaskController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: CommandTokens.CreateTaskCommand,
          useValue: createTaskMock,
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

  // ------------------ CREATE TASK ------------------

  it('POST /task/create creates task', async () => {
    createTaskMock.execute.mockResolvedValue({
      id: 'task-1',
    });

    const res = await request(app.getHttpServer())
      .post('/task/create')
      .send({
        roundId: 'round-1',
        name: 'Task 1',
        descrpition: 'Some description',
        color: 'red',
      })
      .expect(201);

    expect(res.body).toEqual({
      id: 'task-1',
    });

    expect(createTaskMock.execute).toHaveBeenCalledWith({
      roundId: 'round-1',
      user: 'user-id',
      taskCreationData: {
        name: 'Task 1',
        description: 'Some description',
        color: 'red',
      },
    });
  });
});
