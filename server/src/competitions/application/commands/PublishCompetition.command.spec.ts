/* eslint-disable @typescript-eslint/unbound-method */
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { PublishCompetitionCommand } from './PublishCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';

describe('PublishCompetitionCommand', () => {
  let command: PublishCompetitionCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const dbContextMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  };

  const eventDispatcherMock = {
    dispatchEvents: jest.fn(),
  };

  const user = UserEntity.create(
    'test@mail.com',
    Username.create('valid_user_123'),
    InternalFile.define<typeof RelationSlots.user.avatar>(
      'avatar.png',
      'user:avatar',
      'user:avatar',
    ),
  );
  user.__forceSetRole(RoleEnum.ADMIN);

  const competition = {
    id: 'comp-1',
    publish: jest.fn(),
  } as unknown as CompetitionEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.PublishCompetitionCommand,
          useClass: PublishCompetitionCommand,
        },
        { provide: BaseTokens.DBContext, useValue: dbContextMock },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },
        {
          provide: ReposTokens.CompetitionRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();
    command = module.get<PublishCompetitionCommand>(
      CommandTokens.PublishCompetitionCommand,
    );

    jest.clearAllMocks();
  });

  it('should publish competition and save it', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(UserAndCompetitionService, 'publishCompetiton');

    await command.execute({
      user,
      competitionId: 'comp-1',
    });

    expect(mockRepo.findById).toHaveBeenCalledWith('comp-1');
    expect(spy).toHaveBeenCalledWith(competition, user);
    expect(mockRepo.save).toHaveBeenCalledWith(competition);

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();

    expect(competition.publish as unknown as jest.Func).toHaveBeenCalled();
  });

  it('should throw if competition is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        user,
        competitionId: 'comp-1',
      }),
    ).rejects.toThrow();

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });
});
