// server/src/competitions/application/commands/DeleteRound.command.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRoundCommand } from './DeleteRound.command';
import { RoundRepository } from 'src/common/infrastructure/repositories/RoundRepository';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { ApiError, RoundErrors } from 'src/error/ApiError';
import { randomUUID } from 'crypto';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';

describe('DeleteRoundCommand', () => {
  let command: DeleteRoundCommand;
  let roundRepositoryMock: RoundRepository;

  beforeEach(async () => {
    roundRepositoryMock = {
      delete: jest.fn(),
    } as unknown as RoundRepository;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.DeleteRoundCommand,
          useClass: DeleteRoundCommand,
        },
        { provide: ReposTokens.RoundRepository, useValue: roundRepositoryMock },
        { provide: BaseTokens.DBContext, useValue: createMockDBContext() },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
      ],
    }).compile();

    command = module.get<DeleteRoundCommand>(CommandTokens.DeleteRoundCommand);
  });

  it('should delete a round successfully', async () => {
    const roundId = randomUUID();
    await command.execute({ id: roundId });
    expect(roundRepositoryMock.delete).toHaveBeenCalledWith(roundId);
  });

  it('should throw an error if the round is not found', async () => {
    const roundId = randomUUID();
    (roundRepositoryMock.delete as unknown as jest.Mock).mockRejectedValue(
      ApiError.returnNew(RoundErrors.ROUND_NOT_FOUND),
    );

    await expect(command.execute({ id: roundId })).rejects.toThrow(
      ApiError.returnNew(RoundErrors.ROUND_NOT_FOUND),
    );
  });
});
