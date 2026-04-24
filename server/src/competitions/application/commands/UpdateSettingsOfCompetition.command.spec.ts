import { UpdateSettingsOfCompetitionCommand } from './UpdateSettingsOfCompetition.command';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';

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

  const user = { id: 'user-1' } as any;
  const competition = { id: 'comp-1' } as any;

  const settingsInput = {
    maxPlayers: 10,
    mode: 'solo',
  };

  const settingsObject = { mocked: true } as any;

  beforeEach(() => {
    command = new UpdateSettingsOfCompetitionCommand();

    (command as any).competitionRepo = competitionRepo;

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

    expect(competitionRepo.findById).toHaveBeenCalledWith('comp-1');

    expect(CompetitionSettings.fromPlain).toHaveBeenCalledWith(settingsInput);

    expect(spy).toHaveBeenCalledWith(competition, user, settingsObject);

    expect(competitionRepo.save).toHaveBeenCalledWith(competition);
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

    expect(competitionRepo.save).not.toHaveBeenCalled();
  });
});
