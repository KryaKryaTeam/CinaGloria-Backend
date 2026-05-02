import { ScoreEntity } from 'src/judging/domain/entities/Score.entity';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { LeaderboardNode } from './LeaderboardNode.object';

describe('LeaderboardNode', () => {
  const mockTeam = {} as TeamEntity;
  const mockScore = {} as ScoreEntity;

  const validValue = {
    team: mockTeam,
    place: 1,
    sumScore: 100,
    scores: [mockScore],
  };

  describe('define', () => {
    it('should create LeaderboardNode when value is valid', () => {
      const node = LeaderboardNode.define(validValue);

      expect(node).toBeInstanceOf(LeaderboardNode);
      expect(node.value).toEqual(validValue);
    });

    it('should throw error when place is 0', () => {
      expect(() =>
        LeaderboardNode.define({
          ...validValue,
          place: 0,
        }),
      ).toThrow();
    });

    it('should throw error when place is negative', () => {
      expect(() =>
        LeaderboardNode.define({
          ...validValue,
          place: -5,
        }),
      ).toThrow();
    });
  });

  describe('value getter', () => {
    it('should return internal value object', () => {
      const node = LeaderboardNode.define(validValue);

      expect(node.value).toBe(validValue);
    });
  });

  describe('toJSON', () => {
    it('should return raw value for serialization', () => {
      const node = LeaderboardNode.define(validValue);

      expect(node.toJSON).toEqual(validValue);
    });
  });
});
