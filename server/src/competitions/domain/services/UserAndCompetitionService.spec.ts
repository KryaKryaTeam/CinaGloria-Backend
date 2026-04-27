import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { RoleEnum } from 'src/types/RoleEnum';
import { CompetitionStatus } from 'src/types/CompetitionStatus';

describe('UserAndCompetitionService', () => {
  const admin = { role: RoleEnum.ADMIN } as any;
  const organizer = { role: RoleEnum.ORGANIZER } as any;
  const player = { role: RoleEnum.USER } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('permissions', () => {
    it('should allow admin to create competition', () => {
      const result = UserAndCompetitionService.createCompetition(
        {} as any,
        admin,
      );

      expect(result).toBeDefined();
    });

    it('should allow organizer to create competition', () => {
      const result = UserAndCompetitionService.createCompetition(
        {} as any,
        organizer,
      );

      expect(result).toBeDefined();
    });

    it('should block non privileged user', () => {
      expect(() =>
        UserAndCompetitionService.createCompetition({} as any, player),
      ).toThrow();
    });
  });

  describe('editCompetition', () => {
    it('should update provided fields only', () => {
      const competition = {
        name: 'old',
        description: 'old',
      } as any;

      UserAndCompetitionService.editCompetition(
        competition,
        { name: 'new' },
        admin,
      );

      expect(competition.name).toBe('new');
      expect(competition.description).toBe('old');
    });
  });

  describe('schedule publishing', () => {
    it('should schedule competition', () => {
      const competition = {
        schedule: jest.fn(),
      } as any;

      const date = new Date();

      UserAndCompetitionService.schedulePublishing(competition, date, admin);

      expect(competition.schedule).toHaveBeenCalledWith(date);
    });
  });

  describe('decline schedule', () => {
    it('should decline scheduled publish', () => {
      const competition = {
        declineScheduledPublish: jest.fn(),
      } as any;

      UserAndCompetitionService.declineSchedulePublishing(competition, admin);

      expect(competition.declineScheduledPublish).toHaveBeenCalled();
    });
  });

  describe('publish competition', () => {
    it('should set competition status to published', () => {
      const competition = {
        status: null,
      } as any;

      UserAndCompetitionService.publishCompetiton(competition, admin);

      expect(competition.status).toBe(CompetitionStatus.PUBLISHED);
    });
  });

  describe('delete competition', () => {
    it('should throw if competition cannot be deleted', () => {
      const competition = {
        canBeDeleted: false,
      } as any;

      expect(() =>
        UserAndCompetitionService.deleteCompetition(competition, admin),
      ).toThrow();
    });

    it('should allow deletion check if allowed', () => {
      const competition = {
        canBeDeleted: true,
      } as any;

      const result = UserAndCompetitionService.deleteCompetition(
        competition,
        admin,
      );

      expect(result).toBe(true);
    });
  });

  describe('access control', () => {
    it('should allow privileged user to access private competitions', () => {
      const result =
        UserAndCompetitionService.userHasAccessToSeePrivateCompetitions(admin);

      expect(result).toBe(true);
    });

    it('should block normal user indirectly via helper', () => {
      expect(() =>
        UserAndCompetitionService.createCompetition({} as any, player),
      ).toThrow();
    });
  });

  describe('settings', () => {
    it('should update competition settings', () => {
      const competition = {
        settings: null,
      } as any;

      const settings = { maxPlayers: 10 } as any;

      UserAndCompetitionService.chanegeSettingsOfCompetition(
        competition,
        admin,
        settings,
      );

      expect(competition.settings).toBe(settings);
    });
  });
});
