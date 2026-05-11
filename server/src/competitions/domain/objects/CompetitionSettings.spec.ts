import { CompetitionSettings } from 'src/competitions/domain/objects/CompetitionSettings';

describe('CompetitionSettings', () => {
  describe('createDefaults', () => {
    it('should create default settings', () => {
      const settings = CompetitionSettings.createDefaults();

      expect(settings.get('showRoundsOneByOne')).toBe(false);
      expect(settings.get('maxTeamMembers')).toBe(10);
      expect(settings.get('minTeamMembers')).toBe(1);
      expect(settings.get('maxTeams')).toBe(100);
    });
  });

  describe('fromPlain', () => {
    it('should use defaults when no values provided', () => {
      const settings = CompetitionSettings.fromPlain({});

      expect(settings.get('maxTeams')).toBe(100);
      expect(settings.get('minTeamMembers')).toBe(1);
    });

    it('should override provided values', () => {
      const settings = CompetitionSettings.fromPlain({
        maxTeams: 50,
      });

      expect(settings.get('maxTeams')).toBe(50);
    });

    it('should throw on invalid type', () => {
      expect(() =>
        CompetitionSettings.fromPlain({
          maxTeams: 'not-a-number',
        }),
      ).toThrow();
    });
  });

  describe('get/set', () => {
    it('should update value with set()', () => {
      const settings = CompetitionSettings.createDefaults();

      settings.set('maxTeams', 20);

      expect(settings.get('maxTeams')).toBe(20);
    });

    it('should reject invalid type in set()', () => {
      const settings = CompetitionSettings.createDefaults();

      expect(() => {
        settings.set('maxTeams', 'invalid' as any);
      }).toThrow();
    });

    it('should preserve other values when setting one', () => {
      const settings = CompetitionSettings.createDefaults();

      settings.set('maxTeams', 20);

      expect(settings.get('minTeamMembers')).toBe(1);
      expect(settings.get('showRoundsOneByOne')).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should convert to plain object', () => {
      const settings = CompetitionSettings.createDefaults();

      settings.set('maxTeams', 30);

      const json = settings.toJSON();

      expect(json).toEqual({
        showRoundsOneByOne: false,
        maxTeamMembers: 10,
        minTeamMembers: 1,
        maxTeams: 30,
      });
    });
  });
});
