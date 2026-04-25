import { FileMapper } from 'src/files/application/mappers/FileMapper';
import { MimeType } from 'src/files/domain/objects/MimeType.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';

describe('FileMapper', () => {
  const mapper = new FileMapper();

  const schema = {
    url: 'https://file.com/a.png',
    mimeType: 'image/png',
    size: 1234,
    slot: 'file:avatar',
  } as any;

  describe('toEntity', () => {
    it('should map schema to entity correctly', () => {
      const entity = mapper.toEntity(schema);

      expect(entity.url).toBe(schema.url);
      expect(entity.size).toBe(schema.size);
      expect(entity.mimeType).toBeInstanceOf(MimeType);
      expect(entity.mimeType.value).toBe(schema.mimeType);
      expect(entity.slot).toBeInstanceOf(RelationString);
      expect(entity.slot.value).toBe(schema.slot);
    });
  });

  describe('toSchema', () => {
    it('should map entity back to schema correctly', () => {
      const entity = mapper.toEntity(schema);

      const result = mapper.toSchema(entity);

      expect(result).toEqual({
        url: schema.url,
        size: schema.size,
        mimeType: schema.mimeType,
        slot: schema.slot,
      });
    });
  });

  describe('round-trip', () => {
    it('should preserve data through full cycle', () => {
      const entity = mapper.toEntity(schema);
      const back = mapper.toSchema(entity);
      const entity2 = mapper.toEntity(back);

      expect(entity2.url).toBe(entity.url);
      expect(entity2.size).toBe(entity.size);
      expect(entity2.mimeType.value).toBe(entity.mimeType.value);
      expect(entity2.slot.value).toBe(entity.slot.value);
    });
  });
});
