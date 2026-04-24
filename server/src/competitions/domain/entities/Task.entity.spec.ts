import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';

describe('TaskEntity', () => {
  const validData = {
    name: 'Task 1',
    description: 'Some description',
    color: 'RED' as any,
  };

  describe('create/load', () => {
    it('should create task with generated id', () => {
      const task = TaskEntity.create(validData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe(validData.name);
    });

    it('should load task from plain object', () => {
      const created = TaskEntity.create(validData);
      const loaded = TaskEntity.load(created.toJSON());

      expect(loaded.id).toBe(created.id);
      expect(loaded.name).toBe(created.name);
      expect(loaded.description).toBe(created.description);
      expect(loaded.color).toBe(created.color);
    });
  });

  describe('validation (create/load)', () => {
    it('should reject empty name on create', () => {
      expect(() =>
        TaskEntity.create({
          ...validData,
          name: '',
        }),
      ).toThrow();
    });

    it('should reject empty description on create', () => {
      expect(() =>
        TaskEntity.create({
          ...validData,
          description: '',
        }),
      ).toThrow();
    });

    it('should reject invalid name on load', () => {
      const base = TaskEntity.create(validData);

      expect(() =>
        TaskEntity.load({
          ...base.toJSON(),
          name: '',
        }),
      ).toThrow();
    });
  });

  describe('setters', () => {
    it('should update name with validation', () => {
      const task = TaskEntity.create(validData);

      task.name = 'New Name';

      expect(task.name).toBe('New Name');
    });

    it('should trim name', () => {
      const task = TaskEntity.create(validData);

      task.name = '   Clean   ';

      expect(task.name).toBe('Clean');
    });

    it('should reject invalid name via setter', () => {
      const task = TaskEntity.create(validData);

      expect(() => {
        task.name = '';
      }).toThrow();
    });

    it('should update description with validation', () => {
      const task = TaskEntity.create(validData);

      task.description = 'New description';

      expect(task.description).toBe('New description');
    });

    it('should trim description', () => {
      const task = TaskEntity.create(validData);

      task.description = '   text   ';

      expect(task.description).toBe('text');
    });

    it('should reject invalid description via setter', () => {
      const task = TaskEntity.create(validData);

      expect(() => {
        task.description = '';
      }).toThrow();
    });
  });

  describe('color', () => {
    it('should set and get color', () => {
      const task = TaskEntity.create(validData);

      task.color = 'BLUE' as any;

      expect(task.color).toBe('BLUE');
    });
  });

  describe('toJSON', () => {
    it('should serialize correctly', () => {
      const task = TaskEntity.create(validData);

      const json = task.toJSON();

      expect(json.id).toBe(task.id);
      expect(json.name).toBe(task.name);
      expect(json.description).toBe(task.description);
      expect(json.color).toBe(task.color);
    });
  });
});
