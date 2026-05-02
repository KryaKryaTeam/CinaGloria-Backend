import { LeaderboardEntity } from 'src/leaderboard/domain/entities/Leaderboard.entity';
import { LeaderboardSchema } from 'src/schemas/Leaderboard.schema';
import { LeaderboardMapper } from './LeaderboardMapper';

describe('LeaderboardMapper', () => {
  let mapper: LeaderboardMapper;

  const mockRoundMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  } as any;

  beforeEach(() => {
    mapper = new LeaderboardMapper();

    // manual DI injection (no Nest testing module here)
    (mapper as any).roundMapper = mockRoundMapper;

    jest.clearAllMocks();
  });

  describe('toEntity', () => {
    it('should map schema to entity', () => {
      const roundEntityMock = { id: 'round-1' };

      mockRoundMapper.toEntity.mockReturnValue(roundEntityMock);

      const schema: LeaderboardSchema = {
        id: 'leaderboard-1',
        round: { id: 'round-schema' } as any,
        nodes: [{ any: 'node' }] as any,
      };

      const result = mapper.toEntity(schema);

      expect(mockRoundMapper.toEntity).toHaveBeenCalledWith(schema.round);

      expect(result).toBeInstanceOf(LeaderboardEntity);
      expect(result.id).toBe(schema.id);
      expect(result.round).toBe(roundEntityMock);
      expect(result.nodes).toStrictEqual(schema.nodes);
    });
  });

  describe('toSchema', () => {
    it('should map entity to schema', () => {
      const roundSchemaMock = { id: 'round-schema' };

      mockRoundMapper.toSchema.mockReturnValue(roundSchemaMock);

      const entity = {
        id: 'leaderboard-1',
        round: { id: 'round-1' },
        nodes: [{ any: 'node' }],
      } as unknown as LeaderboardEntity;

      const result = mapper.toSchema(entity);

      expect(mockRoundMapper.toSchema).toHaveBeenCalledWith(entity.round);

      expect(result).toEqual({
        id: entity.id,
        round: roundSchemaMock,
        nodes: entity.nodes,
      });
    });
  });
});
