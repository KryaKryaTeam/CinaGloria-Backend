import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';
import { TeamEntity } from '../../domain/entities/Team.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';

export interface ITeamRepository {
  save(ent: TeamEntity): Promise<void>;
  findById(id: string): Promise<TeamEntity | undefined>;
  getAllSerializedMembers(id: string): Promise<UserEntity[]>;
  getActiveCompetition(id: string): Promise<CompetitionEntity | undefined>;
}
