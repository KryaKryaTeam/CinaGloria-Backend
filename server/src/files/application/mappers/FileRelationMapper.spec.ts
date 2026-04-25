import { FileRelationMapper } from 'src/files/application/mappers/FileRelationMapper';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

describe('FileRelationMapper', () => {
  const fileMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  const userMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  const competitionMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  const mapper = new FileRelationMapper(
    userMapper as any,
    fileMapper as any,
    competitionMapper as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toEntity', () => {
    it('should map full schema to entity using sub-mappers', () => {
      fileMapper.toEntity.mockReturnValue({ id: 'file1' });
      userMapper.toEntity.mockReturnValue({ id: 'user1' });
      competitionMapper.toEntity.mockReturnValue({ id: 'comp1' });

      const schema = {
        id: 'rel1',
        file: { raw: 'file' },
        user: { raw: 'user' },
        competition: { raw: 'comp' },
        slot: 'file:avatar',
      } as any;

      const entity = mapper.toEntity(schema);

      expect(fileMapper.toEntity).toHaveBeenCalled();
      expect(userMapper.toEntity).toHaveBeenCalled();
      expect(competitionMapper.toEntity).toHaveBeenCalled();

      expect(entity.id).toBe('rel1');
      expect(entity.slot).toBeInstanceOf(RelationString);
      expect(entity.slot.valueOf()).toBe('file:avatar');
    });

    it('should handle optional fields', () => {
      fileMapper.toEntity.mockReturnValue({ id: 'file1' });

      const schema = {
        id: 'rel1',
        file: { raw: 'file' },
      } as any;

      const entity = mapper.toEntity(schema);

      expect(entity.file).toBeDefined();
      expect(entity.user).toBeUndefined();
      expect(entity.competition).toBeUndefined();
    });
  });

  describe('toSchema', () => {
    it('should throw if entity is incomplete', () => {
      const entity = {
        id: 'rel1',
        filed: false, // triggers error
      } as any;

      expect(() => mapper.toSchema(entity)).toThrow();
    });

    it('should map full entity to schema', () => {
      fileMapper.toSchema.mockReturnValue({ id: 'file-schema' });
      userMapper.toSchema.mockReturnValue({ id: 'user-schema' });
      competitionMapper.toSchema.mockReturnValue({ id: 'comp-schema' });

      const entity = {
        id: 'rel1',
        filed: true,
        file: { id: 'file1' },
        user: { id: 'user1' },
        competition: { id: 'comp1' },
        slot: 'file:avatar',
      } as any;

      const result = mapper.toSchema(entity);

      expect(result.id).toBe('rel1');
      expect(result.file).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.competition).toBeDefined();
      expect(result.slot).toBe('file:avatar');
    });

    it('should include foreign keys when mapping user and competition', () => {
      fileMapper.toSchema.mockReturnValue({});

      const entity = {
        id: 'rel1',
        filed: true,
        file: { id: 'file1' },
        user: { id: 'user1' },
        competition: { id: 'comp1' },
        slot: null,
      } as any;

      const result = mapper.toSchema(entity);

      expect(result.user_id).toBe('user1');
      expect(result.competition_id).toBe('comp1');
    });
  });
});
