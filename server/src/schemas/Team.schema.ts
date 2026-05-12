import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { CompetitionSchema } from './Competition.schema';
import { UserSchema } from './User.schema';
import { ITeamHistoryPlain } from '../teams/domain/objects/TeamHistoryNode.object';
import { TeamStatus } from '../types/TeamStatus';
import { RoundSchema } from './Round.schema';

@Entity({
  name: 'team',
})
export class TeamSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column()
  avatar: string;

  @Column()
  banner: string;

  @JoinTable({ name: 'UserRelTeamMember' })
  @ManyToMany(() => UserSchema, { cascade: true })
  members: UserSchema[];

  @Column({ type: 'varchar' })
  captain: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.IDLE,
  })
  status: TeamStatus;

  @JoinColumn()
  @ManyToOne(() => CompetitionSchema, (competition) => competition.teams, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  activeCompetition?: CompetitionSchema;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  history: ITeamHistoryPlain[];

  @Column({ type: 'timestamp', nullable: true })
  registrationTimeout?: Date;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  memberInvites: any[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => RoundSchema, (round) => round.teams, { nullable: true })
  round?: RoundSchema;
}
