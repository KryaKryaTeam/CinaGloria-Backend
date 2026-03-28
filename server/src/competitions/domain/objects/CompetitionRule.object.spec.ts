import { CompetitionRule } from './CompetitionRule.object';
import { Icons } from 'src/types/Icons';
import { ApiError, DomainErrors } from 'src/error/ApiError';

describe('CompetitionRule', () => {
  const validName = 'Fair Play';
  const validDescription = 'All participants must respect each other.';
  const validIcon = Icons.CODE; // Assuming SHIELD exists in your Icons enum

  describe('define', () => {
    it('should create a valid CompetitionRule instance', () => {
      const rule = CompetitionRule.define(
        validName,
        validDescription,
        validIcon,
      );

      expect(rule).toBeInstanceOf(CompetitionRule);
      expect(rule.value.name).toBe(validName);
      expect(rule.value.description).toBe(validDescription);
      expect(rule.value.icon).toBe(validIcon);
    });

    it('should throw DomainError if name is empty or only whitespace', () => {
      expect(() => {
        CompetitionRule.define('   ', validDescription, validIcon);
      }).toThrow(ApiError);
    });

    it('should throw DomainError if description is empty or only whitespace', () => {
      expect(() => {
        CompetitionRule.define(validName, '', validIcon);
      }).toThrow(ApiError);
    });
  });

  describe('immutability & serialization', () => {
    it('should return a plain object via value getter', () => {
      const rule = CompetitionRule.define(
        validName,
        validDescription,
        validIcon,
      );
      const value = rule.value;

      expect(value).toEqual({
        name: validName,
        description: validDescription,
        icon: validIcon as unknown as Icons,
      });
    });

    it('should return the same data via toJSON', () => {
      const rule = CompetitionRule.define(
        validName,
        validDescription,
        validIcon,
      );
      expect(rule.toJSON).toEqual(rule.value);
    });

    it('should not allow external modification of internal state', () => {
      const rule = CompetitionRule.define(
        validName,
        validDescription,
        validIcon,
      );

      // Attempting to mutate the object returned by the getter
      const val = rule.value;
      (val as { name: string }).name = 'Hacked Name';

      // The actual rule state should remain unchanged
      expect(rule.value.name).toBe(validName);
    });
  });
});
