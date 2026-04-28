import { CompetitionEntity } from '../entities/Competition.entity';
import { RoundEntity } from '../entities/Round.entity';
import { TaskEntity } from '../entities/Task.entity';
import { randomUUID } from 'crypto';
import { Icons } from 'src/types/Icons';
import { RoundStatus } from 'src/types/RoundStatus';
import { CompetitionStatus } from 'src/types/CompetitionStatus';
import { CompetitionSettings } from '../objects/CompetitionSettings';
import { Color } from '../objects/Color.object';
import { RoundAndCompetitionService } from './RoundAndCompetition.service';

describe('RoundAndCompetitionService', () => {
  const task = TaskEntity.load({
    id: randomUUID(),
    name: 'test',
    description: 'test',
    color: Color.define('#000000'),
  });

  const round = RoundEntity.load({
    id: randomUUID(),
    name: 'test',
    description: 'test',
    hidden: false,
    icon: Icons.BOOK,
    startOfRound: new Date(Date.now() + 1000000),
    taskTimeout: new Date(Date.now() + 2000000),
    endOfRound: new Date(Date.now() + 3000000),
    status: RoundStatus.CREATED,
    relatedTasks: [{} as unknown as TaskEntity],
  });

  const competition = CompetitionEntity.load({
    id: randomUUID(),
    status: CompetitionStatus.DRAFT,
    rules: [],
    settings: CompetitionSettings.createDefaults(),
    rounds: [],
    teams: [],
  });
  competition.addRound(round);

  it('should create round via factory', () => {
    expect(round).toBeInstanceOf(RoundEntity);
  });

  it('should create competition via factory', () => {
    expect(competition).toBeInstanceOf(CompetitionEntity);
  });

  it('should create task via factory', () => {
    expect(task).toBeInstanceOf(TaskEntity);
  });

  it('should add task to round via entity method', () => {
    const spy = jest.spyOn(round, 'addTask');

    RoundAndCompetitionService.addTaskToRound(task, round);

    expect(spy).toHaveBeenCalledWith(task);
  });

  it('should add round to competition', () => {
    const spy = jest.spyOn(competition, 'addRound');

    RoundAndCompetitionService.addRoundToCompetition(round, competition);

    expect(spy).toHaveBeenCalledWith(round);
  });

  it('should delete round from competition', () => {
    competition.addRound(round);

    const spy = jest.spyOn(competition, 'deleteRound');

    RoundAndCompetitionService.deleteRoundFromCompetition(round, competition);

    expect(spy).toHaveBeenCalledWith(round);
  });
});
