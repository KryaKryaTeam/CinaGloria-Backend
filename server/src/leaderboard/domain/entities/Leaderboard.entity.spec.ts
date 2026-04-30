import { LeaderboardEntity } from './Leaderboard.entity';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { ILeaderboardNodeValue } from '../objects/LeaderboardNode.object';

describe('LeaderboardEntity', () => {
  const mockRound = { id: 'round-1' } as RoundEntity;
  const mockNode = {
    team: {},
    place: 1,
    sumScore: 100,
    scores: [],
  } as unknown as ILeaderboardNodeValue;

  describe('load', () => {
    it('should create entity from plain data', () => {
      const entity = LeaderboardEntity.load({
        id: 'leaderboard-1',
        nodes: [mockNode],
        round: mockRound,
      });

      expect(entity.id).toBe('leaderboard-1');
      expect(entity.nodes).toEqual([mockNode]);
      expect(entity.round).toBe(mockRound);
    });
  });

  describe('create', () => {
    it('should create entity with generated id', () => {
      const entity = LeaderboardEntity.create({
        nodes: [mockNode],
        round: mockRound,
      });

      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');

      expect(entity.nodes).toEqual([mockNode]);
      expect(entity.round).toBe(mockRound);
    });
  });

  describe('getters', () => {
    it('should return nodes and round correctly', () => {
      const entity = LeaderboardEntity.load({
        id: 'leaderboard-1',
        nodes: [mockNode],
        round: mockRound,
      });

      expect(entity.nodes).toEqual([mockNode]);
      expect(entity.round).toBe(mockRound);
    });
  });

  describe('setters', () => {
    it('should update nodes', () => {
      const entity = LeaderboardEntity.load({
        id: 'leaderboard-1',
        nodes: [],
        round: mockRound,
      });

      const newNodes = [mockNode];

      entity.nodes = newNodes;

      expect(entity.nodes).toEqual(newNodes);
    });

    it('should update round', () => {
      const entity = LeaderboardEntity.load({
        id: 'leaderboard-1',
        nodes: [],
        round: mockRound,
      });

      const newRound = { id: 'round-2' } as RoundEntity;

      entity.round = newRound;

      expect(entity.round).toBe(newRound);
    });
  });

  describe('toJSON', () => {
    it('should serialize entity correctly', () => {
      const entity = LeaderboardEntity.load({
        id: 'leaderboard-1',
        nodes: [mockNode],
        round: mockRound,
      });

      expect(entity.toJSON()).toEqual({
        id: 'leaderboard-1',
        nodes: [mockNode],
        round: mockRound,
      });
    });
  });
});
