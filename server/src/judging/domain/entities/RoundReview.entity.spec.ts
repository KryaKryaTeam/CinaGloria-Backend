import { RoundReviewEntity } from './RoundReview.entity';

describe('RoundReviewEntity', () => {
  const createScoreMock = (id: string, score: number) =>
    ({
      id,
      score,
    }) as any;

  const createRoundMock = () =>
    ({
      id: 'round-id',
    }) as any;

  const createSubmissionMock = () =>
    ({
      id: 'submission-id',
    }) as any;

  describe('create', () => {
    it('should create round review entity', () => {
      const relatedScores = [
        createScoreMock('1', 10),
        createScoreMock('2', 20),
      ];

      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'Good performance',
        byJury: 'jury-id',
        round: createRoundMock(),
        relatedScores,
        submission: createSubmissionMock(),
      });

      expect(entity).toBeInstanceOf(RoundReviewEntity);

      expect(entity.description).toBe('Good performance');
      expect(entity.byJury).toBe('jury-id');
      expect(entity.relatedScores).toEqual(relatedScores);

      expect(entity.summary).toBe(30);

      expect(entity.id).toBeDefined();
    });

    it('should throw if no scores provided', () => {
      expect(() =>
        RoundReviewEntity.create({
          summary: 0,
          description: 'Test',
          byJury: 'jury-id',
          round: createRoundMock(),
          relatedScores: [],
          submission: createSubmissionMock(),
        }),
      ).toThrow();
    });
  });

  describe('load', () => {
    it('should load existing entity', () => {
      const relatedScores = [
        createScoreMock('1', 15),
        createScoreMock('2', 25),
      ];

      const entity = RoundReviewEntity.load({
        id: 'review-id',
        summary: 0,
        description: 'Loaded review',
        byJury: 'jury-id',
        round: createRoundMock(),
        relatedScores,
        submission: createSubmissionMock(),
      });

      expect(entity.id).toBe('review-id');
      expect(entity.summary).toBe(40);
    });

    it('should throw if related scores are empty', () => {
      expect(() =>
        RoundReviewEntity.load({
          id: 'review-id',
          summary: 0,
          description: 'Loaded review',
          byJury: 'jury-id',
          round: createRoundMock(),
          relatedScores: [],
          submission: createSubmissionMock(),
        }),
      ).toThrow();
    });
  });

  describe('setters', () => {
    it('should update fields', () => {
      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'Old',
        byJury: 'old-jury',
        round: createRoundMock(),
        relatedScores: [createScoreMock('1', 10)],
        submission: createSubmissionMock(),
      });

      const newRound = {
        id: 'new-round',
      } as any;

      const newSubmission = {
        id: 'new-submission',
      } as any;

      entity.summary = 100;
      entity.description = 'New description';
      entity.byJury = 'new-jury';
      entity.round = newRound;
      entity.submission = newSubmission;

      expect(entity.summary).toBe(100);
      expect(entity.description).toBe('New description');
      expect(entity.byJury).toBe('new-jury');
      expect(entity.round).toBe(newRound);
      expect(entity.submission).toBe(newSubmission);
    });
  });

  describe('addScore', () => {
    it('should add score to related scores', () => {
      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'Test',
        byJury: 'jury-id',
        round: createRoundMock(),
        relatedScores: [createScoreMock('1', 10)],
        submission: createSubmissionMock(),
      });

      const newScore = createScoreMock('2', 30);

      entity.addScore(newScore);

      expect(entity.relatedScores).toHaveLength(2);
      expect(entity.relatedScores[1]).toEqual(newScore);
    });
  });

  describe('removeScore', () => {
    it('should remove score by id', () => {
      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'Test',
        byJury: 'jury-id',
        round: createRoundMock(),
        relatedScores: [createScoreMock('1', 10), createScoreMock('2', 20)],
        submission: createSubmissionMock(),
      });

      entity.removeScore('2');

      expect(entity.relatedScores).toHaveLength(1);
      expect(entity.relatedScores[0].id).toBe('1');
    });

    it('should throw if score not found', () => {
      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'Test',
        byJury: 'jury-id',
        round: createRoundMock(),
        relatedScores: [createScoreMock('1', 10)],
        submission: createSubmissionMock(),
      });

      expect(() =>
        entity.removeScore('51e9e2ef-7430-45de-a4be-422cb39d4a62'),
      ).toThrow();
    });
  });

  describe('toJSON', () => {
    it('should return plain object', () => {
      const round = createRoundMock();
      const submission = createSubmissionMock();

      const relatedScores = [createScoreMock('1', 10)];

      const entity = RoundReviewEntity.create({
        summary: 0,
        description: 'JSON test',
        byJury: 'jury-id',
        round,
        relatedScores,
        submission,
      });

      const json = entity.toJSON();

      expect(json).toEqual({
        id: entity.id,
        summary: 10,
        description: 'JSON test',
        byJury: 'jury-id',
        round,
        relatedScores,
        submission,
      });
    });
  });
});
