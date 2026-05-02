import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens } from 'src/common/Tokens';
import { TeamMapper } from 'src/teams/application/mappers/team.mapper';
import { CreateTeamCommand } from './application/commands/CreateTeam.command';
import { AcceptMemberInviteCommand } from './application/commands/AcceptMemberInvite.command';
import { CancelRegistrationOfTeamsCommand } from './application/commands/CancelRegistrationOfTeams.command';
import { DeleteMemberCommand } from './application/commands/DeleteMember.command';
import { GetMyTeamsPage } from './application/commands/GetMyTeamsPage.query';
import { InviteMemberCommand } from './application/commands/InviteMember.command';
import { PatchTeamCommand } from './application/commands/PatchTeam.command';
import { RegisterTeamCommand } from './application/commands/RegisterTeam.command';
import { TeamController } from './infrastructure/controllers/team.controller';
import { DeleteTeamCommand } from './application/commands/DeleteTeam.command';
import { ChangeCaptainCommand } from './application/commands/ChangeCaptain.command';

const providers: Provider[] = [
  {
    provide: MapperTokens.TeamMapper,
    useClass: TeamMapper,
  },
  {
    provide: CommandTokens.CreateTeamCommand,
    useClass: CreateTeamCommand,
  },
  {
    provide: CommandTokens.AcceptMemberInviteCommand,
    useClass: AcceptMemberInviteCommand,
  },
  {
    provide: CommandTokens.CancelRegistrationOfTeamsCommand,
    useClass: CancelRegistrationOfTeamsCommand,
  },
  {
    provide: CommandTokens.DeleteMemberCommand,
    useClass: DeleteMemberCommand,
  },
  {
    provide: CommandTokens.GetMyTeamsPageQuery,
    useClass: GetMyTeamsPage,
  },
  { provide: CommandTokens.InviteMemberCommand, useClass: InviteMemberCommand },
  { provide: CommandTokens.PatchTeamCommand, useClass: PatchTeamCommand },
  { provide: CommandTokens.RegisterTeamCommand, useClass: RegisterTeamCommand },
  { provide: CommandTokens.DeleteTeamCommand, useClass: DeleteTeamCommand },
  {
    provide: CommandTokens.ChangeCaptainCommand,
    useClass: ChangeCaptainCommand,
  },
];

@Module({
  providers,
  exports: [...providers],
  controllers: [TeamController],
})
export class TeamsModule {}
