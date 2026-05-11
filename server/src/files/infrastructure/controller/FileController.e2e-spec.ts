import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';

import { CommandTokens } from 'src/common/Tokens';
import { FileController } from './FileController';

// ------------------ mocks ------------------

const uploadFileMock = { execute: jest.fn() };
const getLinkMock = { execute: jest.fn() };

// ------------------ auth mock ------------------

class MockAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();

    req['user_id'] = 'user-id';
    req['user_role'] = 'ADMIN';

    return true;
  }
}

// ------------------ IMPORTANT FIX ------------------
// This prevents Express body parsers from interfering with raw stream
function disableBodyParsing(app: INestApplication) {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  instance.use((req, res, next) => {
    if (req.headers['content-type']?.includes('multipart')) {
      req.body = undefined;
    }
    next();
  });
}

describe('FileController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: CommandTokens.UploadFileCommand,
          useValue: uploadFileMock,
        },
        {
          provide: CommandTokens.GetLinkQuery,
          useValue: getLinkMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalGuards(new MockAuthGuard());

    disableBodyParsing(app);

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------ GET LINK ------------------

  it('GET /file/link/:fileURL returns link', async () => {
    getLinkMock.execute.mockResolvedValue(
      'http://localhost:4000/static/meow.webp',
    );

    const res = await request(app.getHttpServer())
      .get('/file/link/test.webp')
      .expect(200);

    expect(res.text).toBe('http://localhost:4000/static/meow.webp');

    expect(getLinkMock.execute).toHaveBeenCalledWith({
      fileUrl: 'test.webp',
    });
  });

  // ------------------ UPLOAD ------------------

  it('POST /file/upload/:relationString uploads file', async () => {
    uploadFileMock.execute.mockImplementation(async ({ stream }) => {
      // IMPORTANT: consume stream so busboy doesn't hang
      stream.resume?.();

      return {
        file: {
          toJSON: () => ({ id: 'file-1' }),
        },
      };
    });

    const res = await request(app.getHttpServer())
      .post('/file/upload/competition:avatar')
      .attach('file', Buffer.from('hello world'), 'test-file.txt')
      .expect(201);

    expect(res.body).toEqual({ id: 'file-1' });

    expect(uploadFileMock.execute).toHaveBeenCalled();

    const callArg = uploadFileMock.execute.mock.calls[0][0];

    expect(callArg.relationString).toBeDefined();
    expect(callArg.stream).toBeDefined();
  });
});
