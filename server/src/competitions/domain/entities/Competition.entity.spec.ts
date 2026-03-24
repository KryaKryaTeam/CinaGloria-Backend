import {
  CompetitionEntity,
  ICreateCompetition,
  ICompetitionPlain,
} from './Competition.entity';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionRule } from '../objects/CompetitionRule.object';

describe('CompetitionEntity', () => {
  const mockFile = { id: 'file-id', url: 'https://cdn.com/img.png' } as {
    id: string;
    url: string;
  };
  const mockRule = { title: 'Rule 1', content: 'Be nice' } as {
    title: string;
    content: string;
  };

  const validDates = {
    dateOfStartRegistration: new Date('2026-01-01'),
    dateOfEndRegistration: new Date('2026-01-10'),
    dateOfStart: new Date('2026-01-15'),
    dateOfEnd: new Date('2026-01-20'),
  };

  const createBaseParams = (): ICreateCompetition => ({
    name: 'Champion Cup',
    description: 'A great competition',
    banner: mockFile as unknown as InternalFile<'competition:banner'>,
    avatar: mockFile as unknown as InternalFile<'competition:avatar'>,
    ultraWideBanner:
      mockFile as unknown as InternalFile<'competition:ultraWideBanner'>,
    socialMedia: mockFile as unknown as InternalFile<'competition:socialMedia'>,
    ...validDates,
    rules: [mockRule as unknown as CompetitionRule],
  });

  describe('Creation & Loading', () => {
    it('should create a new competition in DRAFT status', () => {
      const competition = CompetitionEntity.create(createBaseParams());

      expect(competition.id).toBeDefined();
      expect(competition.status).toBe(CompetitionStatus.DRAFT);
      expect(competition.name).toBe('Champion Cup');
    });

    it('should load an existing competition from plain object', () => {
      const plain: ICompetitionPlain = {
        id: 'existing-uuid',
        ...createBaseParams(),
        status: CompetitionStatus.PUBLISHED,
      };
      const competition = CompetitionEntity.load(plain);

      expect(competition.id).toBe('existing-uuid');
      expect(competition.status).toBe(CompetitionStatus.PUBLISHED);
    });

    it('should throw DomainError if initial name is too long', () => {
      const params = createBaseParams();
      params.name = 'a'.repeat(256);

      expect(() => CompetitionEntity.create(params)).toThrow(DomainError);
    });
  });

  describe('Date Validation', () => {
    it('should throw if registration ends after competition starts', () => {
      const competition = CompetitionEntity.create(createBaseParams());

      // Attempt to set registration end date to be AFTER the competition start date
      const invalidDate = new Date(validDates.dateOfStart.getTime() + 10000);

      expect(() => {
        competition.dateOfEndRegistration = invalidDate;
      }).toThrow(DomainError);
    });

    it('should allow registration end date to equal competition start date', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      expect(() => {
        competition.dateOfEndRegistration = validDates.dateOfStart;
      }).not.toThrow();
    });
  });

  describe('Status Transitions & Publishing', () => {
    it('should fail to publish if essential fields are missing', () => {
      // Create a "naked" competition with only the name
      const competition = CompetitionEntity.create({
        name: 'Empty Competition',
        description: null,
        banner: null,
        avatar: null,
        ultraWideBanner: null,
        socialMedia: null,
        dateOfStart: null,
        dateOfEnd: null,
        dateOfStartRegistration: null,
        dateOfEndRegistration: null,
        rules: [],
      });

      expect(() => {
        competition.status = CompetitionStatus.PUBLISHED;
      }).toThrow(
        expect.objectContaining({ message: DomainErrors.RESTRICTED_CHANGE }),
      );
    });

    it('should transition from DRAFT to PUBLISHED if all fields are present', () => {
      const competition = CompetitionEntity.create(createBaseParams());

      expect(() => {
        competition.status = CompetitionStatus.PUBLISHED;
      }).not.toThrow();
      expect(competition.status).toBe(CompetitionStatus.PUBLISHED);
    });

    it('should block editing name if status is ARCHIVED', () => {
      // Manually load as CANCELED to test immutability
      const competition = CompetitionEntity.load({
        id: '123',
        ...createBaseParams(),
        status: CompetitionStatus.CANCELED,
      });

      expect(() => {
        competition.name = 'New Name';
      }).toThrow(
        expect.objectContaining({ message: DomainErrors.IMMUTABLE_VALUE }),
      );
    });
  });

  describe('Rules Collection', () => {
    it('should add rules and return a copy (encapsulation check)', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      competition.addRule(mockRule as unknown as CompetitionRule);

      const rules = competition.rules;
      rules.push({} as any); // Try to mutate the returned array

      expect(competition.rules.length).toBe(2); // Should still be 2 (initial + 1), not 3
    });

    it('should delete a rule by index', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      const initialCount = competition.rules.length;

      competition.deleteRule(0);
      expect(competition.rules.length).toBe(initialCount - 1);
    });
  });

  describe('Data Projections (Getters)', () => {
    it('publicInList should return null when in DRAFT', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      expect(competition.publicInList).toBeUndefined();
    });

    it('publicInList should return data when PUBLISHED', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      competition.status = CompetitionStatus.PUBLISHED;

      const data = competition.publicInList;
      expect(data).toBeDefined();
      expect(data).toHaveProperty('name', 'Champion Cup');
      expect(data).not.toHaveProperty('description'); // list view shouldn't have description
    });

    it('toJSON should always return the full plain state', () => {
      const competition = CompetitionEntity.create(createBaseParams());
      const json = competition.toJSON;

      expect(json.status).toBe(CompetitionStatus.DRAFT);
      expect(json.name).toBe('Champion Cup');
    });
  });
});
