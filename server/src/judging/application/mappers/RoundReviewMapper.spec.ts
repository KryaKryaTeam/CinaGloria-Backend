import { RoundReviewMapper } from './RoundReviewMapper';

describe('RoundReviewMapper', () => {
  let mapper: RoundReviewMapper;

  const scoreMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  const roundMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  const submissionMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  beforeEach(() => {
    mapper = new RoundReviewMapper();

    (mapper as any).scoreMapper = scoreMapper;
    (mapper as any).roundMapper = roundMapper;
    (mapper as any).submissionMapper = submissionMapper;

    jest.clearAllMocks();
  });

  it('should map schema to entity using delegated mappers', () => {
    const schema = {
      id: 'review-1',
      byJury: 'jury-1',
      description: 'nice',
      relatedScores: [
        { id: 's1', score: 20 },
        { id: 's2', score: 30 },
      ],
      round: { id: 'r1' },
      submission: { id: 'sub-1' },
    } as any;

    const scoreEntities = [
      { id: 's1-e', score: 30 },
      { id: 's2-e', score: 20 },
    ];
    scoreMapper.toEntity
      .mockReturnValueOnce(scoreEntities[0])
      .mockReturnValueOnce(scoreEntities[1]);

    const roundEntity = { id: 'r1-e' };
    const submissionEntity = { id: 'sub-1-e' };

    roundMapper.toEntity.mockReturnValue(roundEntity);
    submissionMapper.toEntity.mockReturnValue(submissionEntity);

    const result = mapper.toEntity(schema);

    expect(scoreMapper.toEntity).toHaveBeenCalledTimes(2);
    expect(roundMapper.toEntity).toHaveBeenCalledWith(schema.round);
    expect(submissionMapper.toEntity).toHaveBeenCalledWith(schema.submission);

    expect(result.id).toBe('review-1');
    expect(result.byJury).toBe('jury-1');
    expect(result.description).toBe('nice');
    expect(result.summary).toBe(50);
  });

  it('should map entity to schema using delegated mappers', () => {
    const entity = {
      id: 'review-2',
      byJury: 'jury-2',
      description: 'ok',
      summary: 99,
      relatedScores: [{ id: 's1' }],
      round: { id: 'r1' },
      submission: { id: 'sub-1' },
    } as any;

    scoreMapper.toSchema.mockReturnValue({ id: 's1-s' });
    roundMapper.toSchema.mockReturnValue({ id: 'r1-s' });
    submissionMapper.toSchema.mockReturnValue({ id: 'sub-1-s' });

    const result = mapper.toSchema(entity);

    expect(scoreMapper.toSchema).toHaveBeenCalledTimes(1);
    expect(roundMapper.toSchema).toHaveBeenCalledWith(entity.round);
    expect(submissionMapper.toSchema).toHaveBeenCalledWith(entity.submission);

    expect(result).toEqual({
      id: 'review-2',
      byJury: 'jury-2',
      description: 'ok',
      summary: 99,
      relatedScores: [{ id: 's1-s' }],
      round: { id: 'r1-s' },
      submission: { id: 'sub-1-s' },
    });
  });
});
