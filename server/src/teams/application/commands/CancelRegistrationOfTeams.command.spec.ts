import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { ITeamRepository } from '../bounds/TeamRepository';
import { CancelRegistrationOfTeamsCommand } from './CancelRegistrationOfTeams.command';
import { ApiError } from 'src/error/ApiError';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { randomUUID } from 'crypto';

describe('CancelRegistrationOfTeamsCommand', () => {
  let command: CancelRegistrationOfTeamsCommand;
  let teamRepo: ITeamRepository;

  beforeEach(async () => {
    const dbContextMock = createMockDBContext();
    const eventDispatcherMock = createMockEventDispatcher();

    teamRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as ITeamRepository;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.CancelRegistrationOfTeamsCommand,
          useClass: CancelRegistrationOfTeamsCommand,
        },
        { provide: BaseTokens.DBContext, useValue: dbContextMock },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },
        {
          provide: ReposTokens.TeamRepository,
          useValue: teamRepo,
        },
      ],
    }).compile();

    command = module.get<CancelRegistrationOfTeamsCommand>(
      CommandTokens.CancelRegistrationOfTeamsCommand,
    );

    jest.clearAllMocks();
  });

  it('should cancel registration of a team successfully', async () => {
    const actor = UserEntity.createFake();
    const team = TeamEntity.createFake(actor.id);

    team.startRegistration(randomUUID());

    (teamRepo.findById as jest.Mock).mockResolvedValue(team);

    await command.implementation({ actor, teamId: team.id });

    expect(teamRepo.findById).toHaveBeenCalledWith(team.id);
    expect(teamRepo.save).toHaveBeenCalledWith(team);
  });

  it('should throw ApiError if team is not found', async () => {
    const actor = UserEntity.createFake();
    const teamId = 'team-id';

    (teamRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(command.implementation({ actor, teamId })).rejects.toThrow(
      ApiError,
    );
    expect(teamRepo.findById).toHaveBeenCalledWith(teamId);
  });
});
