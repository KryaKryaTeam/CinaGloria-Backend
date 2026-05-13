import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { CommandTokens } from 'src/common/Tokens';
import { WSController } from './WebsocketContorller';

// ------------------ mock ------------------

const generateTicketMock = { execute: jest.fn() };

// ------------------ auth mock ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = 'user-id';
    req['user_role'] = 'ADMIN';

    return true;
  }
}

describe('WSController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WSController],
      providers: [
        {
          provide: CommandTokens.GenerateTicketCommand,
          useValue: generateTicketMock,
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

  // ------------------ GET TOKEN ------------------

  it('GET /ws/token returns websocket token', async () => {
    generateTicketMock.execute.mockResolvedValue('ws-token-123');

    const res = await request(app.getHttpServer()).get('/ws/token').expect(200);

    expect(res.body).toEqual({
      token: 'ws-token-123',
    });

    expect(generateTicketMock.execute).toHaveBeenCalledWith('user-id');
  });
});
