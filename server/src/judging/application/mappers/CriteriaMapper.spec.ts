import { CriteriaSchema } from 'src/schemas/Criteria.schema';
import { CriteriaMapper } from './CriteriaMapper';
import { Icons } from 'src/types/Icons';
import { CriteriaEntity } from 'src/task-collector/domain/entities/Criteria.entity';

describe('CriteriaMapper', () => {
  let mapper: CriteriaMapper;

  beforeEach(() => {
    mapper = new CriteriaMapper();
  });

  describe('toEntity', () => {
    it('should map schema to entity using CriteriaEntity.load', () => {
      const schema: CriteriaSchema = {
        id: '8aebe33e-9600-4c00-9e50-3fbe180f8f0d',
        name: 'Test name',
        description: 'Test description',
        icon: Icons.BOOK,
        visibility: true,
      } as CriteriaSchema;

      const mockEntity = CriteriaEntity.load({
        id: '8a5ccb93-b3e7-4baf-a345-10f83fc99397',
        name: 'test',
        description: 'test',
        icon: Icons.GAVEL,
        visibility: false,
      });

      const loadSpy = jest
        .spyOn(CriteriaEntity, 'load')
        .mockReturnValue(mockEntity);

      const result = mapper.toEntity(schema);

      expect(loadSpy).toHaveBeenCalledWith(schema);
      expect(result).toBe(mockEntity);
    });
  });

  describe('toSchema', () => {
    it('should map entity to schema correctly', () => {
      const data = {
        id: '81ed78a0-0377-4203-83d7-2165960e17df',
        name: 'test',
        description: 'tst',
        icon: Icons.BOOK,
        visibility: true,
      };
      const entity = CriteriaEntity.load(data);

      const result = mapper.toSchema(entity);

      expect(result).toEqual(data);
    });
  });
  describe('round-trip', () => {
    it('should map schema -> entity -> schema consistently', () => {
      const original: CriteriaSchema = {
        id: '11111111-2222-3333-4444-555555555555',
        name: 'Round trip test',
        description: 'Nothing should break',
        icon: Icons.GAVEL,
        visibility: true,
      } as CriteriaSchema;

      // no mocking here — we want real behavior
      const entity = mapper.toEntity(original);
      const result = mapper.toSchema(entity);

      expect(result).toEqual(original);
    });
  });
});
