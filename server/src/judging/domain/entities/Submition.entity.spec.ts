import { SubmitionEntity } from './Submition.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

describe('SubmitionEntity', () => {
  const tasks = [{} as TaskEntity];

  const validData = {
    id: '11111111-2222-3333-4444-555555555555',
    createdAt: new Date('2024-01-01'),
    githubURL: 'https://github.com/test',
    youtubeURL: 'https://youtube.com/test',
    assignedToJury: 'jury-1',
    relatedTasks: tasks,
  };

  describe('load', () => {
    it('should create entity from valid data', () => {
      const entity = SubmitionEntity.load(validData);

      expect(entity.id).toBe(validData.id);
      expect(entity.createdAt).toEqual(validData.createdAt);
      expect(entity.githubURL).toBe(validData.githubURL);
      expect(entity.youtubeURL).toBe(validData.youtubeURL);
      expect(entity.assignedToJury).toBe(validData.assignedToJury);
      expect(entity.relatedTasks).toBe(validData.relatedTasks);
    });

    it('should throw if githubURL is empty', () => {
      expect(() =>
        SubmitionEntity.load({
          ...validData,
          githubURL: '   ',
        }),
      ).toThrow();
    });

    it('should throw if youtubeURL is empty', () => {
      expect(() =>
        SubmitionEntity.load({
          ...validData,
          youtubeURL: '   ',
        }),
      ).toThrow();
    });

    it('should throw if jury is empty', () => {
      expect(() =>
        SubmitionEntity.load({
          ...validData,
          assignedToJury: '   ',
        }),
      ).toThrow();
    });

    it('should throw if no related tasks', () => {
      expect(() =>
        SubmitionEntity.load({
          ...validData,
          relatedTasks: [],
        }),
      ).toThrow();
    });
  });

  describe('create', () => {
    it('should generate id and createdAt', () => {
      const entity = SubmitionEntity.create({
        githubURL: validData.githubURL,
        youtubeURL: validData.youtubeURL,
        assignedToJury: validData.assignedToJury,
        relatedTasks: validData.relatedTasks,
      });

      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('should validate input before creation', () => {
      expect(() =>
        SubmitionEntity.create({
          githubURL: '',
          youtubeURL: validData.youtubeURL,
          assignedToJury: validData.assignedToJury,
          relatedTasks: validData.relatedTasks,
        }),
      ).toThrow();
    });
  });

  describe('setters', () => {
    it('should update fields correctly', () => {
      const entity = SubmitionEntity.load(validData);

      const newDate = new Date('2025-01-01');
      const newTasks = [{} as TaskEntity, {} as TaskEntity];

      entity.createdAt = newDate;
      entity.githubURL = 'https://github.com/new';
      entity.youtubeURL = 'https://youtube.com/new';
      entity.assignedToJury = 'jury-2';
      entity.relatedTasks = newTasks;

      expect(entity.createdAt).toEqual(newDate);
      expect(entity.githubURL).toBe('https://github.com/new');
      expect(entity.youtubeURL).toBe('https://youtube.com/new');
      expect(entity.assignedToJury).toBe('jury-2');
      expect(entity.relatedTasks).toBe(newTasks);
    });
  });

  describe('toJSON', () => {
    it('should return correct plain object', () => {
      const entity = SubmitionEntity.load(validData);

      expect(entity.toJSON()).toEqual(validData);
    });
  });
});
