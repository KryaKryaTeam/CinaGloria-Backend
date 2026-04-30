import { ScoreEntity } from '../../../judging/domain/entities/Score.entity';
import { ScoreSchema } from '../../../schemas/Score.schema';
import { TaskSchema } from 'src/schemas/Task.schema';
import { ScoreMapper } from './ScoreMapper';
import { Color } from 'src/competitions/domain/objects/Color.object';
import { RoundSchema } from 'src/schemas/Round.schema';
import { Icons } from 'src/types/Icons';
import { RoundStatus } from 'src/types/RoundStatus';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

describe('ScoreMapper', () => {
  let mapper: ScoreMapper;

  const taskMapperMock = {
    toEntity: jest.fn((t) => t),
    toSchema: jest.fn((t) => t),
  };

  beforeEach(() => {
    mapper = new ScoreMapper();
    (mapper as any).taskMapper = taskMapperMock;
  });

  const createFullRoundSchema = (): RoundSchema => {
    const round = new RoundSchema();

    const now = new Date();

    round.id = 'round-1';
    round.name = 'Test Round';
    round.description = 'Some test description';
    round.icon = Icons.BOOK;
    round.hidden = false;

    round.startOfRound = new Date(now.getTime() + 1000 * 60 * 60); // +1h
    round.endOfRound = new Date(now.getTime() + 1000 * 60 * 60 * 2); // +2h

    round.status = RoundStatus.CREATED;

    round.relatedTasks = []; // valid empty relation

    return round;
  };

  const createFullTaskSchema = (): TaskSchema => {
    const task = new TaskSchema();
    task.id = 'task-1';

    task.color = '#000000';
    task.name = 'test';
    task.description = 'test';
    task.round = createFullRoundSchema();

    return task;
  };

  const createFullScoreSchema = (): ScoreSchema => {
    const score = new ScoreSchema();

    score.id = 'score-1';
    score.score = 100;
    score.team = 'team-1';

    score.task = createFullTaskSchema(); // assuming you already have this

    return score;
  };

  const createFullTaskEntity = (): TaskEntity => {
    return TaskEntity.create({
      name: 'Test Task',
      description: 'Some valid description',
      color: Color.define('#000000'),
    });
  };

  const createFullScoreEntity = (): ScoreEntity => {
    return ScoreEntity.load({
      id: 'score-1',
      score: 100,
      team: 'team-1',
      task: createFullTaskEntity(),
    });
  };

  describe('toEntity', () => {
    it('should map full ScoreSchema to ScoreEntity', () => {
      const schema = createFullScoreSchema();

      const entity = mapper.toEntity(schema);

      expect(entity).toBeInstanceOf(ScoreEntity);
      expect(entity.id).toBe(schema.id);
      expect(entity._score).toBe(schema.score);
      expect(entity.team).toBe(schema.team);
      expect(entity.task).toEqual(schema.task);
    });
  });

  describe('toSchema', () => {
    it('should map ScoreEntity back to full ScoreSchema', () => {
      const entity = createFullScoreEntity();

      const schema = mapper.toSchema(entity);

      expect(JSON.parse(JSON.stringify(schema.task))).toEqual(
        JSON.parse(JSON.stringify(entity.task)),
      );
    });
  });
});
