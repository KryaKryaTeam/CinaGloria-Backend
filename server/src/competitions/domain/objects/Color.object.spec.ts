import { Color } from 'src/competitions/domain/objects/Color.object';

describe('Color', () => {
  describe('define', () => {
    it('should create valid hex color (3-digit)', () => {
      const color = Color.define('#FFF');

      expect(color).toBeInstanceOf(Color);
      expect(color.value).toBe('#FFF');
    });

    it('should create valid hex color (6-digit)', () => {
      const color = Color.define('#A1B2C3');

      expect(color.value).toBe('#A1B2C3');
    });

    it('should throw on invalid color', () => {
      expect(() => Color.define('red')).toThrow('Invalid color');
      expect(() => Color.define('#GGG')).toThrow('Invalid color');
      expect(() => Color.define('#12345')).toThrow('Invalid color');
    });
  });

  describe('value', () => {
    it('should return raw value', () => {
      const color = Color.define('#ABCDEF');

      expect(color.value).toBe('#ABCDEF');
    });
  });

  describe('serialization', () => {
    it('should return raw value via toJSON getter', () => {
      const color = Color.define('#ABC');

      expect(color.toJSON).toBe('#ABC');
    });
  });
});
