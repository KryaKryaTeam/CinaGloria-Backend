import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { SubmissionController } from './submission.controller';
import { CommandTokens } from 'src/common/Tokens';
import { RoleEnum } from 'src/types/RoleEnum';
import { APP_GUARD } from '@nestjs/core';

describe('SubmissionController (e2e)', () => {
  let app: INestApplication;

  const createSubmissionCommand = { execute: jest.fn() };
  const updateSubmissionCommand = { execute: jest.fn() };
  const findSubmissionByIdCommand = { execute: jest.fn() };
  const deleteSubmissionCommand = { execute: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: CommandTokens.CreateSubmissionCommand,
          useValue: createSubmissionCommand,
        },
        {
          provide: CommandTokens.UpdateSubmissionCommand,
          useValue: updateSubmissionCommand,
        },
        {
          provide: CommandTokens.FindSubmissionByIdCommand,
          useValue: findSubmissionByIdCommand,
        },
        {
          provide: CommandTokens.DeleteSubmissionCommand,
          useValue: deleteSubmissionCommand,
        },

        // bypass guards
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: (ctx: any) => {
              const req = ctx.switchToHttp().getRequest();

              req.user = {
                id: 'user-1',
                role: RoleEnum.USER,
              };

              return true;
            },
          },
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
        transform: true,
      }),
    );

    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  const createDto = {
    githubURL: 'github.com/test',
    youtubeURL: 'youtube.com/test',
    relatedRound: 'round-1',
  };

  const updateDto = {
    id: 'sub-1',
    githubURL: 'new-github',
    youtubeURL: 'new-youtube',
  };

  it('POST /v1/submission/create', async () => {
    await request(app.getHttpServer())
      .post('/v1/submission/create')
      .send(createDto)
      .expect(201);

    expect(createSubmissionCommand.execute).toHaveBeenCalledWith(createDto);
  });

  it('GET /v1/submission/find', async () => {
    findSubmissionByIdCommand.execute.mockResolvedValue({
      id: 'sub-1',
    });

    const res = await request(app.getHttpServer())
      .get('/v1/submission/find?id=sub-1')
      .expect(200);

    expect(findSubmissionByIdCommand.execute).toHaveBeenCalledWith('sub-1');

    expect(res.body).toEqual({ id: 'sub-1' });
  });

  it('PATCH /v1/submission/update', async () => {
    await request(app.getHttpServer())
      .patch('/v1/submission/update')
      .send(updateDto)
      .expect(200);

    expect(updateSubmissionCommand.execute).toHaveBeenCalledWith(updateDto);
  });

  it('DELETE /v1/submission/delete', async () => {
    await request(app.getHttpServer())
      .delete('/v1/submission/delete?id=sub-1')
      .expect(200);

    expect(deleteSubmissionCommand.execute).toHaveBeenCalledWith('sub-1');
  });
});
