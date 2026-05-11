import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { DeclineScheduledPublishCommand } from './DeclineScheduleOfPublishingOfCompetition.command';
import { ApiError } from 'src/error/ApiError';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RoleEnum } from 'src/types/RoleEnum';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';
import { randomUUID } from 'crypto';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { Icons } from 'src/types/Icons';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('DeclineScheduledPublishCommand', () => {
  let command: DeclineScheduledPublishCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const dbContextMock = createMockDBContext();

  const eventDispatcherMock = createMockEventDispatcher();

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

  const now = Date.now();

  const competition = CompetitionEntity.load({
    id: randomUUID(),

    name: 'Test',
    description: 'Test',

    ultraWideBanner: undefined,
    banner: undefined,
    avatar: undefined,
    socialMedia: undefined,

    dateOfStartRegistration: new Date(now + 1000000),
    dateOfEndRegistration: new Date(now + 2000000),
    dateOfStart: new Date(now + 3000000),
    dateOfEnd: new Date(now + 4000000),

    publishAt: undefined,

    status: CompetitionStatus.SCHEDULED,

    rules: [CompetitionRule.define('test', 'test', Icons.BOOK)],
    settings: CompetitionSettings.createDefaults(),

    rounds: [],
    teams: [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.DeclineScheduledPublishCommand,
          useClass: DeclineScheduledPublishCommand,
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
    command = module.get<DeclineScheduledPublishCommand>(
      CommandTokens.DeclineScheduledPublishCommand,
    );

    jest.clearAllMocks();
  });

  it('should decline scheduled publishing and save competition', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(
      UserAndCompetitionService,
      'declineSchedulePublishing',
    );

    await command.execute({
      user,
      competitionId: competition.id,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith(competition.id);
    expect(spy).toHaveBeenCalledWith(competition, user);
    expect(mockRepo.save).toHaveBeenCalledWith(competition);

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();
  });

  it('should throw if competition is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const throwSpy = jest.spyOn(ApiError, 'throw');

    await expect(
      command.execute({
        user,
        competitionId: randomUUID(),
      }),
    ).rejects.toThrow();

    expect(throwSpy).toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });
});
