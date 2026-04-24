import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { CompetitionEntity } from '../entities/Competition.entity';
import { RoundEntity } from '../entities/Round.entity';
import { TaskEntity } from '../entities/Task.entity';

describe('RoundAndCompetitionService', () => {
  let service: RoundAndCompetitionService;

  beforeEach(() => {
    service = new RoundAndCompetitionService();
  });

  it('should create round via factory', () => {
    const round = service.createRound({} as any);

    expect(round).toBeInstanceOf(RoundEntity);
  });

  it('should create competition via factory', () => {
    const competition = service.createCompetition({} as any);

    expect(competition).toBeInstanceOf(CompetitionEntity);
  });

  it('should create task via factory', () => {
    const task = service.createTask({} as any);

    expect(task).toBeInstanceOf(TaskEntity);
  });

  it('should add task to round via entity method', () => {
    const round = RoundEntity.create({} as any);
    const task = TaskEntity.create({} as any);

    const spy = jest.spyOn(round, 'addTask');

    service.addTaskToRound(task, round);

    expect(spy).toHaveBeenCalledWith(task);
  });

  it('should add round to competition', () => {
    const competition = CompetitionEntity.create({} as any);
    const round = RoundEntity.create({} as any);

    const spy = jest.spyOn(competition, 'addRound');

    service.addRoundToCompetition(round, competition);

    expect(spy).toHaveBeenCalledWith(round);
  });

  it('should delete round from competition', () => {
    const competition = CompetitionEntity.create({} as any);
    const round = RoundEntity.create({} as any);

    const spy = jest.spyOn(competition, 'deleteRound');

    service.deleteRoundFromCompetition(round, competition);

    expect(spy).toHaveBeenCalledWith(round);
  });
});
