import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { RoundReviewController } from './roundReview.controller';
import { CommandTokens } from 'src/common/Tokens';
import { APP_GUARD } from '@nestjs/core';
import { RoleEnum } from 'src/types/RoleEnum';

describe('RoundReviewController (e2e)', () => {
  let app: INestApplication;

  const createRoundReviewCommand = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RoundReviewController],
      providers: [
        {
          provide: CommandTokens.CreateRoundReviewCommand,
          useValue: createRoundReviewCommand,
        },

        // mock auth guard
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: jest.fn((context) => {
              const request = context.switchToHttp().getRequest();

              request.user = {
                id: 'judge-id',
                role: RoleEnum.JUDGE,
              };

              return true;
            }),
          },
        },

        // mock role guard
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: jest.fn(() => true),
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

  const dto = {
    summary: 50,
    description: 'Great performance',
    byJury: 'c4be1f98-9fb5-486e-a0af-e224a6afb76a',
    round: '0c4977b5-4fc1-4cbd-ac00-7338d9a6f638',
    relatedScores: [
      '969f194f-ba68-49e9-9f6f-d47e63e23ea1',
      '3f4358aa-7e47-410b-8918-ed8b970c0cfd',
    ],
    submission: '421ba85a-64aa-4489-8580-24af5ec8c7d7',
  };

  it('POST /round_review/create should create review', async () => {
    await request(app.getHttpServer())
      .post('/v1/round_review/create')
      .send(dto)
      .expect(201);

    expect(createRoundReviewCommand.execute).toHaveBeenCalledTimes(1);

    expect(createRoundReviewCommand.execute).toHaveBeenCalledWith(dto);
  });

  it('should return 400 for invalid dto', async () => {
    await request(app.getHttpServer())
      .post('/v1/round_review/create')
      .send({
        description: 123,
      })
      .expect(400);

    expect(createRoundReviewCommand.execute).not.toHaveBeenCalled();
  });
});
