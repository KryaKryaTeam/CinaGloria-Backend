import { SubmitionEntity } from 'src/judging/domain/entities/Submition.entity';
import { SubmitionMapper } from './SubmitionMapper';
import { TaskMapper } from 'src/competitions/application/mapper/Task.mapper';

describe('SubmitionMapper', () => {
  let mapper: SubmitionMapper;

  const taskMapperMock: jest.Mocked<TaskMapper> = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  } as any;

  const schema = {
    id: '1',
    createdAt: new Date('2024-01-01'),
    githubURL: 'github',
    youtubeURL: 'youtube',
    assignedToJury: 'jury',
    relatedTasks: [{ id: 't1' }, { id: 't2' }] as any,
  };

  beforeEach(() => {
    mapper = new SubmitionMapper();

    // inject mock
    (mapper as any).taskMapper = taskMapperMock;

    jest.clearAllMocks();
  });

  describe('toEntity', () => {
    it('should map schema and delegate tasks to TaskMapper', () => {
      const taskEntities = [{ id: 'e1' }, { id: 'e2' }];

      taskMapperMock.toEntity
        .mockReturnValueOnce(taskEntities[0] as any)
        .mockReturnValueOnce(taskEntities[1] as any);

      const result = mapper.toEntity(schema as any);

      expect(taskMapperMock.toEntity).toHaveBeenCalledTimes(2);
      expect(taskMapperMock.toEntity).toHaveBeenCalledWith(
        schema.relatedTasks[0],
      );
      expect(taskMapperMock.toEntity).toHaveBeenCalledWith(
        schema.relatedTasks[1],
      );

      expect(result).toBeInstanceOf(SubmitionEntity);

      expect(result.relatedTasks).toEqual(taskEntities);
      expect(result.githubURL).toBe(schema.githubURL);
      expect(result.youtubeURL).toBe(schema.youtubeURL);
      expect(result.assignedToJury).toBe(schema.assignedToJury);
    });
  });

  describe('toSchema', () => {
    it('should map entity and delegate tasks to TaskMapper', () => {
      const entity = SubmitionEntity.load({
        id: schema.id,
        createdAt: schema.createdAt,
        githubURL: schema.githubURL,
        youtubeURL: schema.youtubeURL,
        assignedToJury: schema.assignedToJury,
        relatedTasks: [{ id: 't1' }, { id: 't2' }] as any,
      });

      const taskSchemas = [{ id: 's1' }, { id: 's2' }];

      taskMapperMock.toSchema
        .mockReturnValueOnce(taskSchemas[0] as any)
        .mockReturnValueOnce(taskSchemas[1] as any);

      const result = mapper.toSchema(entity);

      expect(taskMapperMock.toSchema).toHaveBeenCalledTimes(2);

      expect(result.relatedTasks).toEqual(taskSchemas);
      expect(result.id).toBe(entity.id);
      expect(result.githubURL).toBe(entity.githubURL);
      expect(result.youtubeURL).toBe(entity.youtubeURL);
      expect(result.assignedToJury).toBe(entity.assignedToJury);
      expect(result.createdAt).toEqual(entity.createdAt);
    });
  });
});
