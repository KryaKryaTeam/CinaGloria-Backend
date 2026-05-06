import { Test } from '@nestjs/testing';
import { ChangeCaptainCommand } from './ChangeCaptain.command';
import { TeamEntityHelperService } from '../../domain/services/TeamEntityHelper.service';
import { UserEntity } from '../../../authorization/domain/entities/User.entity';
import { ITeamRepository } from '../bounds/TeamRepository';
import { IUserRepository } from '../../../authorization/application/bounds/IUserRepository';
import { ApiError } from '../../../error/ApiError';
import { TeamEntity } from 'src/teams/domain/entities/Team.entity';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('ChangeCaptainCommand', () => {
  let command: ChangeCaptainCommand;
  let teamRepo: ITeamRepository;
  let userRepo: IUserRepository;

  beforeEach(async () => {
    const dbContextMock = createMockDBContext();
    const eventDispatcherMock = createMockEventDispatcher();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeCaptainCommand,
        {
          provide: ReposTokens.TeamRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        { provide: BaseTokens.DBContext, useValue: dbContextMock },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: eventDispatcherMock,
        },
        {
          provide: ReposTokens.UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        TeamEntityHelperService,
      ],
    }).compile();

    command = moduleRef.get<ChangeCaptainCommand>(ChangeCaptainCommand);
    teamRepo = moduleRef.get<ITeamRepository>(ReposTokens.TeamRepository);
    userRepo = moduleRef.get<IUserRepository>(ReposTokens.UserRepository);
  });

  describe('implementation', () => {
    it('should change the captain of a team successfully', async () => {
      const teamId = '1';
      const actor = UserEntity.createFake();
      const target = UserEntity.createFake();

      // 1. Capture the fake team so we can check it in the expectation
      const fakeTeam = TeamEntity.createFake(actor.id);

      jest
        .spyOn(teamRepo, 'findById')
        .mockResolvedValueOnce(fakeTeam as unknown as TeamEntity);

      jest.spyOn(userRepo, 'findById').mockResolvedValueOnce(target);
      jest.spyOn(TeamEntityHelperService, 'changeCaptain');

      await command.implementation({
        actor,
        target: target.id,
        teamId,
      });

      expect(TeamEntityHelperService.changeCaptain).toHaveBeenCalledWith(
        fakeTeam,
        actor,
        target,
      );
    });

    it('should throw an ApiError if the team is not found', async () => {
      const teamId = '1';
      const targetId = '3';

      const actor = UserEntity.createFake();
      jest
        .spyOn(teamRepo, 'findById')
        .mockResolvedValueOnce(null as unknown as TeamEntity);

      await expect(
        command.implementation({
          actor,
          target: targetId,
          teamId,
        }),
      ).rejects.toThrow(ApiError);
    });

    it('should throw an ApiError if the target user is not found', async () => {
      const teamId = '1';
      const targetId = '3';

      const actor = UserEntity.createFake();
      jest
        .spyOn(teamRepo, 'findById')
        .mockResolvedValueOnce({} as unknown as TeamEntity);
      jest.spyOn(userRepo, 'findById').mockResolvedValueOnce(null);

      await expect(
        command.implementation({
          actor,
          target: targetId,
          teamId,
        }),
      ).rejects.toThrow(ApiError);
    });
  });
});
