import { ScoreEntity, IScorePlain } from './Score.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

describe('ScoreEntity', () => {
  const mockTask = {} as TaskEntity;

  const baseData: IScorePlain = {
    id: 'score-1',
    score: 100,
    team: 'TeamA',
    task: mockTask,
  };

  describe('load', () => {
    it('should load an existing ScoreEntity correctly', () => {
      const entity = ScoreEntity.load(baseData);

      expect(entity.id).toBe(baseData.id);
      expect(entity.score).toBe(baseData.score);
      expect(entity.team).toBe(baseData.team);
      expect(entity.task).toBe(baseData.task);
    });
  });

  describe('create', () => {
    it('should create a new ScoreEntity with generated id', () => {
      const entity = ScoreEntity.create({
        score: 50,
        team: 'TeamB',
        task: mockTask,
      });

      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      expect(entity.score).toBe(50);
      expect(entity.team).toBe('TeamB');
      expect(entity.task).toBe(mockTask);
    });
  });

  describe('setters and getters', () => {
    it('should update score via setter', () => {
      const entity = ScoreEntity.load(baseData);

      entity.score = 200;

      expect(entity.score).toBe(200);
    });

    it('should return correct values from getters', () => {
      const entity = ScoreEntity.load(baseData);

      expect(entity.id).toBe(baseData.id);
      expect(entity.score).toBe(baseData.score);
      expect(entity.team).toBe(baseData.team);
      expect(entity.task).toBe(baseData.task);
    });
  });

  describe('toJSON', () => {
    it('should serialize correctly', () => {
      const entity = ScoreEntity.load(baseData);

      const json = entity.toJSON();

      expect(json).toEqual({
        id: baseData.id,
        score: baseData.score,
        team: baseData.team,
        task: baseData.task,
      });
    });
  });
});
