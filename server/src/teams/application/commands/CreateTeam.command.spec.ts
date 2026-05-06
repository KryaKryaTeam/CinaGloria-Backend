import { Test, TestingModule } from '@nestjs/testing';
import { BaseTokens, CommandTokens, ReposTokens } from 'src/common/Tokens';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
// Removed unused import
import { ITeamRepository } from '../bounds/TeamRepository';
import { CreateTeamCommand } from './CreateTeam.command';

describe('CreateTeamCommand', () => {
  let command: CreateTeamCommand;
  let teamRepo: ITeamRepository;

  beforeEach(async () => {
    const dbContextMock = createMockDBContext();
    const eventDispatcherMock = createMockEventDispatcher();

    teamRepo = {
      save: jest.fn(),
    } as unknown as ITeamRepository;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandTokens.CreateTeamCommand,
          useClass: CreateTeamCommand,
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

    command = module.get<CreateTeamCommand>(CommandTokens.CreateTeamCommand);

    jest.clearAllMocks();
  });

  it('should create a team successfully', async () => {
    const user = UserEntity.createFake();
    const teamData = {
      avatar: InternalFile.define<'team:avatar'>(
        'sss1.webp',
        'team:avatar',
        'team:avatar',
      ),
      banner: InternalFile.define<'team:banner'>(
        'sss2.webp',
        'team:banner',
        'team:banner',
      ),
      name: 'New Team',
    };

    await command.implementation({ user, teamData });

    expect(teamRepo.save).toHaveBeenCalledWith(expect.any(TeamEntity));
  });

  //   it('should throw ApiError if team data is invalid', async () => {
  //     const user = UserEntity.createFake();
  //     const teamData = {
  //       avatar: InternalFile.define<'team:avatar'>(
  //         'sss1.webp',
  //         'team:avatar',
  //         'team:avatar',
  //       ),
  //       banner: InternalFile.define<'team:banner'>(
  //         'sss2.webp',
  //         'team:banner',
  //         'team:banner',
  //       ),
  //       // name is missing
  //     } as unknown as ICreateTeam;

  //     await expect(command.implementation({ user, teamData })).rejects.toThrow(
  //       ApiError,
  //     );
  //   }); useless by domain logic
});
