import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { RoleEnum } from 'src/types/RoleEnum';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { CompetitionEntity } from '../entities/Competition.entity';
import { CompetitionSettings } from '../objects/CompetitionSettings';

describe('UserAndCompetitionService', () => {
  const admin = { role: RoleEnum.ADMIN } as unknown as UserEntity;
  const organizer = { role: RoleEnum.ORGANIZER } as unknown as UserEntity;
  const player = { role: RoleEnum.USER } as unknown as UserEntity;

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
      } as unknown as CompetitionEntity;

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
      } as unknown as CompetitionEntity;

      const date = new Date();

      UserAndCompetitionService.schedulePublishing(competition, date, admin);

      expect(competition.schedule).toHaveBeenCalledWith(date);
    });
  });

  describe('decline schedule', () => {
    it('should decline scheduled publish', () => {
      const competition = {
        declineScheduledPublish: jest.fn(),
      } as unknown as CompetitionEntity;

      UserAndCompetitionService.declineSchedulePublishing(competition, admin);

      expect(competition.declineScheduledPublish).toHaveBeenCalled();
    });
  });

  describe('publish competition', () => {
    it('should set competition status to published', () => {
      const competition = {
        status: null,
        publish: jest.fn(
          () => (competition.status = CompetitionStatus.PUBLISHED),
        ),
      } as unknown as CompetitionEntity;

      UserAndCompetitionService.publishCompetiton(competition, admin);

      expect(competition.status).toBe(CompetitionStatus.PUBLISHED);
      expect(competition.publish as unknown as jest.Func).toHaveBeenCalled();
    });
  });

  describe('delete competition', () => {
    it('should throw if competition cannot be deleted', () => {
      const competition = {
        canBeDeleted: false,
      } as unknown as CompetitionEntity;

      expect(() =>
        UserAndCompetitionService.deleteCompetition(competition, admin),
      ).toThrow();
    });

    it('should allow deletion check if allowed', () => {
      const competition = {
        canBeDeleted: true,
      } as unknown as CompetitionEntity;

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
      } as unknown as CompetitionEntity;

      const settings = { maxPlayers: 10 } as unknown as CompetitionSettings;

      UserAndCompetitionService.chanegeSettingsOfCompetition(
        competition,
        admin,
        settings,
      );

      expect(competition.settings).toBe(settings);
    });
  });
});
