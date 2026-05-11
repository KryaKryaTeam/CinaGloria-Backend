import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { CommandTokens } from 'src/common/Tokens';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

// mocks
const loginCommandMock = {
  execute: jest.fn(),
};

const registrationCommandMock = {
  execute: jest.fn(),
};

const refreshCommandMock = {
  execute: jest.fn(),
};

const validationCommandMock = {
  execute: jest.fn(),
};

const csrfCommandMock = {
  execute: jest.fn(),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CommandTokens.LoginCommand, useValue: loginCommandMock },
        {
          provide: CommandTokens.RegistrationCommand,
          useValue: registrationCommandMock,
        },
        { provide: CommandTokens.RefreshCommand, useValue: refreshCommandMock },
        {
          provide: CommandTokens.ValidateRegistrationCommand,
          useValue: validationCommandMock,
        },
        { provide: CommandTokens.GetCSRFToken, useValue: csrfCommandMock },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue({
              httpOnly: true,
              sameSite: 'lax',
              secure: false,
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------ CSRF ------------------

  it('GET /auth/csrf sets csrf cookie', async () => {
    csrfCommandMock.execute.mockResolvedValue('csrf-token');

    const res = await request(app.getHttpServer())
      .get('/auth/csrf')
      .expect(200);

    expect(res.body).toEqual({ csrf: 'csrf-token' });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // ------------------ LOGIN ------------------

  it('POST /auth/login success', async () => {
    loginCommandMock.execute.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      userExists: true,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login?provider=local&state=123')
      .set('Cookie', ['csrf=123'])
      .send({ password: '1234' })
      .expect(201);

    expect(res.body).toEqual({
      accessToken: 'access',
      userExistsBefore: true,
    });

    expect(loginCommandMock.execute).toHaveBeenCalled();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /auth/login fails without csrf', async () => {
    await request(app.getHttpServer())
      .post('/auth/login?provider=local&state=123')
      .send({ password: '1234' })
      .expect(500); // depends on your ApiError mapping
  });

  // ------------------ REGISTRATION ------------------

  it('POST /auth/registration success', async () => {
    registrationCommandMock.execute.mockResolvedValue({
      requestId: 'req-id',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/registration?provider=local&state=123')
      .set('Cookie', ['csrf=123'])
      .send({ email: 'test@mail.com' })
      .expect(201);

    expect(res.body).toEqual({
      requestId: 'req-id',
    });
  });

  // ------------------ CONTINUE ------------------

  it('POST /auth/continue success', async () => {
    validationCommandMock.execute.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/continue?state=123')
      .set('Cookie', ['csrf=123'])
      .send({ code: '123', requestId: 'req' })
      .expect(201);

    expect(res.body).toEqual({
      accessToken: 'access',
    });

    expect(res.headers['set-cookie']).toBeDefined();
  });

  // ------------------ REFRESH ------------------

  it('POST /auth/refresh success', async () => {
    refreshCommandMock.execute.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', ['refresh=old-refresh'])
      .expect(201);

    expect(res.body).toEqual({
      accessToken: 'new-access',
    });

    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /auth/refresh fails without cookie', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').expect(500);
  });

  // ------------------ LOGOUT ------------------

  it('PUT /auth/logout clears cookie', async () => {
    const res = await request(app.getHttpServer())
      .put('/auth/logout')
      .expect(200);

    expect(res.headers['set-cookie']).toBeDefined();
  });
});
