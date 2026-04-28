import { randomUUID } from 'crypto';
import {
  CompetitionEntity,
  ICreateCompetition,
  ICompetitionPlain,
} from './Competition.entity';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { ApiError } from 'src/error/ApiError';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { CompetitionRule } from '../objects/CompetitionRule.object';
import { AppSlotCode, RelationSlots } from 'src/types/RelationSlots';

describe('CompetitionEntity', () => {
  // --- Mocks & Helpers ---
  const mockFile = <T extends AppSlotCode>(id: string) =>
    ({
      id,
      url: `https://cdn.com/${id}.png`,
    }) as unknown as InternalFile<T>;
  const mockRule = (title: string) =>
    ({ title, content: 'Rules content' }) as unknown as CompetitionRule;

  const getValidDates = () => {
    const now = Date.now();
    return {
      publishAt: new Date(now + 1000), // T + 1s
      dateOfStartRegistration: new Date(now + 5000), // T + 5s
      dateOfEndRegistration: new Date(now + 10000), // T + 10s
      dateOfStart: new Date(now + 15000), // T + 15s
      dateOfEnd: new Date(now + 20000), // T + 20s
    };
  };

  const createFullParams = (): ICreateCompetition =>
    ({
      name: 'Pro League 2026',
      description: 'The ultimate showdown.',
      banner: mockFile<typeof RelationSlots.competition.banner>('banner'),
      avatar: mockFile<typeof RelationSlots.competition.avatar>('avatar'),
      ultraWideBanner:
        mockFile<typeof RelationSlots.competition.ultraWideBanner>('uw-banner'),
      socialMedia:
        mockFile<typeof RelationSlots.competition.socialMedia>('social'),
      ...getValidDates(),
      rules: [mockRule('Rule 1')],
      teams: [],
      rounds: [],
    }) as unknown as ICreateCompetition;

  // --- Tests ---

  describe('Lifecycle: Construction & Loading', () => {
    it('should initialize a new competition as a DRAFT', () => {
      const params = createFullParams();
      const competition = CompetitionEntity.create(params);

      expect(competition.status).toBe(CompetitionStatus.DRAFT);
      expect(competition.id).toBeDefined();
      expect(competition.name).toBe(params.name);
    });

    it('should successfully hydrate an existing entity via load()', () => {
      const plain: ICompetitionPlain = {
        id: randomUUID(),
        ...createFullParams(),
        status: CompetitionStatus.PUBLISHED,
      } as unknown as ICompetitionPlain;

      const entity = CompetitionEntity.load(plain);
      expect(entity.toJSON()).toEqual(plain);
    });

    it('should prevent loading a non-DRAFT entity if required fields are missing', () => {
      const incompletePlain: ICompetitionPlain = {
        id: randomUUID(),
        ...createFullParams(),
        name: null, // Critical missing field
        status: CompetitionStatus.PUBLISHED,
      } as unknown as ICompetitionPlain;

      expect(() => CompetitionEntity.load(incompletePlain)).toThrow(ApiError);
    });
  });

  describe('Domain Logic: Date Invariants', () => {
    let competition: CompetitionEntity;

    beforeEach(() => {
      competition = CompetitionEntity.create(createFullParams());
    });

    it('should throw if the start date is after the end date', () => {
      const start = new Date('2026-10-10');
      const end = new Date('2026-09-09');

      expect(() => {
        competition.dateOfStart = start;
        competition.dateOfEnd = end;
      }).toThrow();
    });

    it('should allow registration to end exactly when the competition starts', () => {
      const sharedTime = createFullParams().dateOfEndRegistration;

      expect(() => {
        competition.dateOfEndRegistration = sharedTime as unknown as Date;
        competition.dateOfStart = sharedTime as unknown as Date;
      }).not.toThrow();
    });
  });

  describe('Domain Logic: State Transitions', () => {
    it('should allow transition from DRAFT to SCHEDULED via schedule() method', () => {
      const competition = CompetitionEntity.create(createFullParams());
      const publishDate = new Date(Date.now() + 2000);

      competition.schedule(publishDate);

      expect(competition.status).toBe(CompetitionStatus.SCHEDULED);
      expect(competition.publishAt).toEqual(publishDate);
    });

    it('should prohibit direct manual status change to SCHEDULED', () => {
      const competition = CompetitionEntity.create(createFullParams());
      expect(() => {
        competition.status = CompetitionStatus.SCHEDULED;
      }).toThrow(ApiError);
    });

    it('should lock the entity from modifications once it hits an immutable state (e.g., CANCELED)', () => {
      const competition = CompetitionEntity.load({
        id: randomUUID(),
        ...createFullParams(),
        status: CompetitionStatus.CANCELED,
      } as unknown as ICompetitionPlain);

      expect(() => {
        competition.name = 'New Title';
      }).toThrow(ApiError);
    });
  });

  describe('Encapsulation & Projections', () => {
    it('should ensure the rules array is not mutable from the outside', () => {
      const competition = CompetitionEntity.create(createFullParams());
      const rulesReference = competition.rules;

      // Attempt mutation
      rulesReference.push(mockRule('Evil Rule'));

      expect(competition.rules).toHaveLength(1);
    });

    it('should correctly project data for public view only when not in DRAFT', () => {
      const competition = CompetitionEntity.create(createFullParams());

      // Act 1: Check Draft
      expect(competition.publicInList).toBeUndefined();

      // Act 2: Publish
      competition.status = CompetitionStatus.PUBLISHED;

      // Assert
      const projection = competition.publicInList;
      expect(projection).toBeDefined();
      expect(projection?.id).toBe(competition.id);
      expect(projection).not.toHaveProperty('description'); // Logic: list doesn't need desc
    });
  });

  describe('Validation: String Constraints', () => {
    it.each([
      ['empty string', '   '],
      ['too long', 'a'.repeat(256)],
    ])('should throw error if name is %s', (_, value) => {
      const params = createFullParams();
      params.name = value;

      expect(() => CompetitionEntity.create(params)).toThrow();
    });
  });
});
