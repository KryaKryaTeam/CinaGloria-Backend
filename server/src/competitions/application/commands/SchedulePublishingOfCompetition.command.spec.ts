import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ScheduleCompetitionPublishCommand } from './SchedulePublishingOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { randomUUID } from 'crypto';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';
import { Icons } from 'src/types/Icons';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

describe('ScheduleCompetitionPublishCommand', () => {
  let command: ScheduleCompetitionPublishCommand;

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

  const now = Date.now();
  const competition = CompetitionEntity.load({
    id: randomUUID(),

    name: 'Test',
    description: 'Test',

    ultraWideBanner: InternalFile.define(
      'test',
      'competition:ultraWideBanner',
      'competition:ultraWideBanner',
    ),
    banner: InternalFile.define(
      'test',
      'competition:banner',
      'competition:banner',
    ),
    avatar: InternalFile.define(
      'test',
      'competition:avatar',
      'competition:avatar',
    ),
    socialMedia: InternalFile.define(
      'test',
      'competition:socialMedia',
      'competition:socialMedia',
    ),

    dateOfStartRegistration: new Date(now + 1000000),
    dateOfEndRegistration: new Date(now + 2000000),
    dateOfStart: new Date(now + 3000000),
    dateOfEnd: new Date(now + 4000000),

    publishAt: undefined,

    status: CompetitionStatus.DRAFT,

    rules: [CompetitionRule.define('test', 'test', Icons.BOOK)],
    settings: CompetitionSettings.createDefaults(),
  });
  const publishAt = new Date('2026-01-01T10:00:00Z');

  beforeEach(() => {
    command = new ScheduleCompetitionPublishCommand();
    (command as any).competitionRepository = mockRepo;
    (command as any).DBContext = dbContextMock;
    (command as any).eventDispatcher = eventDispatcherMock;

    jest.clearAllMocks();
  });

  it('should schedule publishing and save competition', async () => {
    mockRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(UserAndCompetitionService, 'schedulePublishing');

    await command.execute({
      competitionId: competition.id,
      user,
      publishAt,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith(competition.id);

    expect(spy).toHaveBeenCalledWith(competition, publishAt, user);

    expect(mockRepo.save).toHaveBeenCalledWith(competition);

    expect(dbContextMock.startTransaction).toHaveBeenCalled();
    expect(dbContextMock.commitTransaction).toHaveBeenCalled();
    expect(eventDispatcherMock.dispatchEvents).toHaveBeenCalled();
  });

  it('should throw if competition not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        competitionId: 'comp-1',
        user,
        publishAt,
      }),
    ).rejects.toThrow();

    expect(mockRepo.save).not.toHaveBeenCalled();
    expect(dbContextMock.rollbackTransaction).toHaveBeenCalled();
  });
});
