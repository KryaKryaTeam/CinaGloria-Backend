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
];

@Module({
  providers,
  exports: [...providers],
})
export class TeamsModule {}
