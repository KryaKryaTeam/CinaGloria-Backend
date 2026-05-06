import { AcceptMemberInviteCommand } from './AcceptMemberInvite.command';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { ApiError } from 'src/error/ApiError';
import { ITeamRepository } from '../bounds/TeamRepository';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('AcceptMemberInviteCommand', () => {
  let command: AcceptMemberInviteCommand;
  let teamRepo: ITeamRepository;

  beforeEach(async () => {
    teamRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as ITeamRepository;

    const dbContextMock = createMockDBContext();
    const eventDispatcherMock = createMockEventDispatcher();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.AcceptMemberInviteCommand,
          useClass: AcceptMemberInviteCommand,
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
    command = module.get<AcceptMemberInviteCommand>(
      CommandTokens.AcceptMemberInviteCommand,
    );

    jest.clearAllMocks();
  });

  it('should accept member invite and add member to team', async () => {
    const actor = UserEntity.createFake();
    const teamId = 'team-id';
    const team = TeamEntity.createFake();
    team.acceptInvite = jest.fn();
    team.addMember = jest.fn();

    (teamRepo.findById as jest.Mock).mockResolvedValue(team);

    await command.implementation({ actor, teamId });

    expect(teamRepo.findById).toHaveBeenCalledWith(teamId);
    expect(team.acceptInvite).toHaveBeenCalledWith(actor.id);
    expect(team.addMember).toHaveBeenCalledWith(actor.id);
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
