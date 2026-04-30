// server/src/competitions/application/commands/PatchRound.command.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PatchRoundCommand } from './PatchRound.command';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundErrors, UserErrors } from 'src/error/ApiError';
import { RoleEnum } from 'src/types/RoleEnum';
import { RoundEntity } from 'src/competitions/domain/entities/Round.entity';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('PatchRoundCommand', () => {
  let command: PatchRoundCommand;

  const mockRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchRoundCommand,
        { provide: ReposTokens.RoundRepository, useValue: mockRepo },
        { provide: BaseTokens.DBContext, useValue: createMockDBContext() },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
      ],
    }).compile();

    command = module.get<PatchRoundCommand>(PatchRoundCommand);

    jest.clearAllMocks();
  });

  it('should patch a round successfully', async () => {
    const user = UserEntity.createFake();
    user.__forceSetRole(RoleEnum.ADMIN);
    const round = RoundEntity.createFake();

    mockRepo.findById.mockResolvedValue(round);

    await command.execute({
      user,
      roundId: round.id,
      ...round,
    });

    expect(mockRepo.findById).toHaveBeenCalledWith(round.id);
    expect(mockRepo.save).toHaveBeenCalledWith(round);
  });

  it('should throw an error if the user does not have enough rights', async () => {
    const user = UserEntity.createFake();
    user.__forceSetRole(RoleEnum.USER);
    const roundId = 'fake-round-id';

    await expect(command.execute({ user, roundId })).rejects.toThrow(
      ApiError.returnNew(UserErrors.NOT_ENOUGH_RIGHTS),
    );

    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw an error if the round is not found', async () => {
    const user = UserEntity.createFake();
    user.__forceSetRole(RoleEnum.ADMIN);
    const roundId = 'fake-round-id';

    mockRepo.findById.mockResolvedValue(null);

    await expect(command.execute({ user, roundId })).rejects.toThrow(
      ApiError.returnNew(RoundErrors.ROUND_NOT_FOUND),
    );

    expect(mockRepo.findById).toHaveBeenCalledWith(roundId);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
