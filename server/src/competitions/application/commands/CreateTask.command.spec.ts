// server/src/competitions/application/commands/CreateTask.command.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskCommand } from './CreateTask.command';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { TaskRepository } from 'src/common/infrastructure/repositories/TaskRepository';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundErrors, TaskErrors } from 'src/error/ApiError';
import { randomUUID } from 'crypto';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { RoleEnum } from 'src/types/RoleEnum';
import { RelationSlots } from 'src/types/RelationSlots';
import { RoundAndCompetitionService } from 'src/competitions/domain/services/RoundAndCompetition.service';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';

describe('CreateTaskCommand', () => {
  let command: CreateTaskCommand;
  let taskRepositoryMock: TaskRepository;
  let roundRepositoryMock: RoundRepository;

  const user = UserEntity.create(
    'test@mail.com',
    Username.create('valid_user_123'),
    InternalFile.define<typeof RelationSlots.user.avatar>(
      'avatar.png',
      'user:avatar',
      'user:avatar',
    ),
  );
  user.__forceSetRole(RoleEnum.ADMIN);

  beforeEach(async () => {
    taskRepositoryMock = {
      findRelatedRound: jest.fn(),
      save: jest.fn(),
    } as unknown as TaskRepository;

    roundRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as RoundRepository;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.CreateTaskCommand,
          useClass: CreateTaskCommand,
        },
        { provide: ReposTokens.TaskRepository, useValue: taskRepositoryMock },
        { provide: ReposTokens.RoundRepository, useValue: roundRepositoryMock },
        { provide: BaseTokens.DBContext, useValue: createMockDBContext() },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
      ],
    }).compile();

    command = module.get<CreateTaskCommand>(CommandTokens.CreateTaskCommand);
  });

  it('should create a task and save the round', async () => {
    const roundId = randomUUID();
    const taskCreationData = {
      name: 'Test Task',
      description: 'This is a test task.',
      color: '#FF5733',
    };

    const fakeRound = {
      id: roundId,
      addTask: jest.fn(),
    };

    (
      taskRepositoryMock.findRelatedRound as unknown as {
        mockResolvedValue: (data: unknown) => void;
      }
    ).mockResolvedValue(fakeRound);

    await command.execute({
      user,
      roundId,
      taskCreationData,
    });

    expect(taskRepositoryMock.findRelatedRound).toHaveBeenCalledWith(roundId);
    expect(fakeRound.addTask).toHaveBeenCalled();
    expect(taskRepositoryMock.save).toHaveBeenCalledWith(expect.any(Object));
    expect(roundRepositoryMock.save).toHaveBeenCalledWith(fakeRound);
  });

  it('should throw an error if the round is not found', async () => {
    const roundId = randomUUID();
    const taskCreationData = {
      name: 'Test Task',
      description: 'This is a test task.',
      color: '#FF5733',
    };

    (
      taskRepositoryMock.findRelatedRound as unknown as {
        mockResolvedValue: (data: unknown) => void;
      }
    ).mockResolvedValue(null);

    await expect(
      command.execute({
        user,
        roundId,
        taskCreationData,
      }),
    ).rejects.toThrow(ApiError.returnNew(RoundErrors.ROUND_NOT_FOUND));
  });

  it('should throw an error if the task creation fails', async () => {
    const roundId = randomUUID();
    const taskCreationData = {
      name: 'Test Task',
      description: 'This is a test task.',
      color: '#FF5733',
    };

    (
      taskRepositoryMock.findRelatedRound as unknown as jest.Mock
    ).mockResolvedValue(RoundEntity.createFake());

    jest
      .spyOn(RoundAndCompetitionService, 'createTask')
      .mockReturnValue(null as unknown as TaskEntity);

    await expect(
      command.execute({
        user,
        roundId,
        taskCreationData,
      }),
    ).rejects.toThrow(ApiError.returnNew(TaskErrors.TASK_NOT_FOUND));
  });
});
