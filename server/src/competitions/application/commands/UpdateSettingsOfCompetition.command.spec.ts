import { UpdateSettingsOfCompetitionCommand } from './UpdateSettingsOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoleEnum } from 'src/types/RoleEnum';

jest.mock('src/competitions/domain/objects/CompetitionSettings', () => ({
  CompetitionSettings: {
    fromPlain: jest.fn(),
  },
}));

describe('UpdateSettingsOfCompetitionCommand', () => {
  let command: UpdateSettingsOfCompetitionCommand;

  const competitionRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockDBContext = {
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventDispatcher = {
    addEvent: jest.fn(),
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

  const competition = { id: 'comp-1' } as any;

  const settingsInput = {
    maxPlayers: 10,
    mode: 'solo',
  };

  const settingsObject = { mocked: true } as any;

  beforeEach(() => {
    command = new UpdateSettingsOfCompetitionCommand();

    (command as any).competitionRepo = competitionRepo;
    (command as any).DBContext = mockDBContext;
    (command as any).eventDispatcher = mockEventDispatcher;

    jest.clearAllMocks();

    (CompetitionSettings.fromPlain as jest.Mock).mockReturnValue(
      settingsObject,
    );
  });

  it('should update competition settings and save', async () => {
    competitionRepo.findById.mockResolvedValue(competition);

    const spy = jest.spyOn(
      UserAndCompetitionService,
      'chanegeSettingsOfCompetition',
    );

    await command.execute({
      competitionId: 'comp-1',
      user,
      settings: settingsInput,
    });

    expect(mockDBContext.startTransaction).toHaveBeenCalled();

    expect(competitionRepo.findById).toHaveBeenCalledWith('comp-1');

    expect(CompetitionSettings.fromPlain).toHaveBeenCalledWith(settingsInput);

    expect(spy).toHaveBeenCalledWith(competition, user, settingsObject);

    expect(competitionRepo.save).toHaveBeenCalledWith(competition);

    expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();

    expect(mockDBContext.commitTransaction).toHaveBeenCalled();
  });

  it('should throw if competition not found', async () => {
    competitionRepo.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        competitionId: 'comp-1',
        user,
        settings: settingsInput,
      }),
    ).rejects.toThrow();

    expect(mockDBContext.startTransaction).toHaveBeenCalled();
    expect(mockDBContext.rollbackTransaction).toHaveBeenCalled();

    expect(mockEventDispatcher.dispatchEvents).not.toHaveBeenCalled();

    expect(competitionRepo.save).not.toHaveBeenCalled();
  });
});
