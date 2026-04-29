import { CriteriaEntity } from './Criteria.entity';
import { Icons } from 'src/types/Icons';

describe('CriteriaEntity', () => {
  const validData = {
    id: '11111111-2222-3333-4444-555555555555',
    name: 'Valid name',
    description: 'Valid description',
    icon: Icons.BOOK,
    visibility: true,
  };

  describe('load', () => {
    it('should create entity from valid data', () => {
      const entity = CriteriaEntity.load(validData);

      expect(entity.id).toBe(validData.id);
      expect(entity.name).toBe(validData.name);
      expect(entity.description).toBe(validData.description);
      expect(entity.icon).toBe(validData.icon);
      expect(entity.visibility).toBe(validData.visibility);
    });

    it('should throw if name is empty', () => {
      expect(() =>
        CriteriaEntity.load({
          ...validData,
          name: '   ',
        }),
      ).toThrow();
    });

    it('should throw if name is too long', () => {
      expect(() =>
        CriteriaEntity.load({
          ...validData,
          name: 'a'.repeat(256),
        }),
      ).toThrow();
    });

    it('should throw if description is too long', () => {
      expect(() =>
        CriteriaEntity.load({
          ...validData,
          description: 'a'.repeat(1001),
        }),
      ).toThrow();
    });
  });

  describe('create', () => {
    it('should create entity with generated id', () => {
      const entity = CriteriaEntity.create({
        name: validData.name,
        description: validData.description,
        icon: validData.icon,
        visibility: validData.visibility,
      });

      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      expect(entity.name).toBe(validData.name);
    });

    it('should throw on invalid data', () => {
      expect(() =>
        CriteriaEntity.create({
          name: '',
          description: validData.description,
          icon: validData.icon,
          visibility: validData.visibility,
        }),
      ).toThrow();
    });
  });

  describe('setters', () => {
    it('should update fields correctly', () => {
      const entity = CriteriaEntity.load(validData);

      entity.name = 'New name';
      entity.description = 'New description';
      entity.visibility = false;
      entity.icon = Icons.GAVEL;

      expect(entity.name).toBe('New name');
      expect(entity.description).toBe('New description');
      expect(entity.visibility).toBe(false);
      expect(entity.icon).toBe(Icons.GAVEL);
    });
  });

  describe('toJSON', () => {
    it('should return correct plain object', () => {
      const entity = CriteriaEntity.load(validData);

      const json = entity.toJSON();

      expect(json).toEqual(validData);
    });
  });
});
