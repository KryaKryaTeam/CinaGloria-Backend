import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { CreateRoundCommand } from './CreateRound.command';
import { randomUUID } from 'crypto';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ApiError, CompetitionErrors } from 'src/error/ApiError';

describe('CreateRoundCommand', () => {
  let command: CreateRoundCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const dbContextMock = createMockDBContext();
  const eventDispatcherMock = createMockEventDispatcher();

  let user: UserEntity;

  const competitionId = randomUUID();
  const competition = CompetitionEntity.createFake();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.CreateRoundCommand,
          useClass: CreateRoundCommand,
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
    command = module.get<CreateRoundCommand>(CommandTokens.CreateRoundCommand);

    user = UserEntity.createFake();
    user.__forceSetRole(RoleEnum.ADMIN);

    jest.clearAllMocks();
  });

  it('should create a round and save the competition', async () => {
    const roundData = RoundEntity.createFake();

    mockRepo.findById.mockResolvedValue(competition);

    await command.execute({
      user,
      competitionId,
      roundData: roundData.toJSON(),
    });

    expect(mockRepo.findById).toHaveBeenCalledWith(competitionId);
    expect(competition.rounds.length).toBeGreaterThan(0);
    expect(mockRepo.save).toHaveBeenCalledWith(competition);

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();
  });

  it('should throw if user does not have enough rights', async () => {
    user.__forceSetRole(RoleEnum.USER);

    const roundData = RoundEntity.createFake();

    await expect(
      command.execute({
        user,
        competitionId,
        roundData,
      }),
    ).rejects.toThrow(ApiError);

    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });

  it('should throw if competition is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const roundData = RoundEntity.createFake();

    user.__forceSetRole(RoleEnum.ADMIN);
    console.log(user);

    await expect(
      command.execute({
        user,
        competitionId: competition.id,
        roundData,
      }),
    ).rejects.toThrow(ApiError.returnNew(CompetitionErrors.UNDEFINED));

    expect(mockRepo.findById).toHaveBeenCalledWith(competition.id);
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });
});
