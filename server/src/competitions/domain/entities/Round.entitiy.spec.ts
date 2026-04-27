import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { RoundStatus } from 'src/types/RoundStatus';

describe('RoundEntity', () => {
  const baseDate = new Date(Date.now() + 100000);

  const validData = {
    name: 'Round 1',
    description: 'Some description',
    icon: 'ICON' as any,
    startOfRound: baseDate,
    endOfRound: new Date(baseDate.getTime() + 100000),
    relatedTasks: [],
    hidden: false,
  };

  describe('create/load', () => {
    it('should create round with default CREATED status', () => {
      const round = RoundEntity.create(validData);

      expect(round).toBeDefined();
      expect(round.status).toBe(RoundStatus.CREATED);
      expect(round.hidden).toBe(false);
    });

    it('should load from plain object', () => {
      const created = RoundEntity.create(validData);
      const loaded = RoundEntity.load(created.toJSON());

      expect(loaded.id).toBe(created.id);
      expect(loaded.status).toBe(created.status);
    });
  });

  describe('visibility', () => {
    it('should hide round', () => {
      const round = RoundEntity.create(validData);

      round.hide();

      expect(round.hidden).toBe(true);
    });

    it('should show round', () => {
      const round = RoundEntity.create(validData);

      round.hide();
      round.show();

      expect(round.hidden).toBe(false);
    });
  });

  describe('task management', () => {
    it('should add task', () => {
      const round = RoundEntity.create(validData);
      const task = { id: 't1' } as any;

      round.addTask(task);

      expect(round.relatedTasks).toContain(task);
    });

    it('should remove task', () => {
      const task = { id: 't1' } as any;

      const round = RoundEntity.create({
        ...validData,
        relatedTasks: [task],
      });

      round.removeTask(task);

      expect(round.relatedTasks).not.toContain(task);
    });

    it('should throw if task not found', () => {
      const round = RoundEntity.create(validData);

      expect(() => round.removeTask({ id: 'missing' } as any)).toThrow();
    });
  });

  describe('name validation', () => {
    it('should reject empty name', () => {
      const round = RoundEntity.create(validData);

      expect(() => {
        round.name = '';
      }).toThrow();
    });

    it('should accept valid name', () => {
      const round = RoundEntity.create(validData);

      round.name = 'New Name';

      expect(round.name).toBe('New Name');
    });
  });

  describe('description validation', () => {
    it('should reject empty description', () => {
      const round = RoundEntity.create(validData);

      expect(() => {
        round.description = '';
      }).toThrow();
    });
  });

  describe('status transitions', () => {
    it('should allow valid transition CREATED -> IN_PROGRESS', () => {
      const round = RoundEntity.create(validData);

      round.status = RoundStatus.IN_PROGRESS;

      expect(round.status).toBe(RoundStatus.IN_PROGRESS);
    });

    it('should block invalid transition', () => {
      const round = RoundEntity.create(validData);

      expect(() => {
        round.status = RoundStatus.FINISHED;
      }).toThrow();
    });
  });

  describe('date validation', () => {
    it('should reject past start date', () => {
      const round = RoundEntity.create(validData);

      expect(() => {
        round.startOfRound = new Date(Date.now() - 100000);
      }).toThrow();
    });

    it('should reject invalid date sequence', () => {
      const round = RoundEntity.create(validData);

      expect(() => {
        round.endOfRound = new Date(baseDate.getTime() - 1000);
      }).toThrow();
    });
  });

  describe('toJSON', () => {
    it('should serialize round correctly', () => {
      const round = RoundEntity.create(validData);

      const json = round.toJSON();

      expect(json.id).toBe(round.id);
      expect(json.status).toBe(round.status);
      expect(json.name).toBe(round.name);
    });
  });
});
