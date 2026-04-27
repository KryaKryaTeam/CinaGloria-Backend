import type { ICompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { CompetitionStatus } from '../types/CompetitionStatus';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoundSchema } from './Round.schema';
import { TeamSchema } from './Team.schema';

@Entity({
  name: 'competition',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class CompetitionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  ultraWideBanner?: string;

  @Column({ type: 'varchar', nullable: true })
  banner?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  socialMedia?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStart?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEnd?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStartRegistration?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEndRegistration?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'jsonb', default: [] })
  rules: ICompetitionRule[];

  @OneToMany(() => TeamSchema, (team) => team.activeCompetition)
  teams: TeamSchema[];

  @OneToMany(() => RoundSchema, (round) => round.competition, {
    onDelete: 'CASCADE',
  })
  rounds: RoundSchema[];

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    enumName: 'competition_status',
  })
  status: CompetitionStatus;

  @Column({
    type: 'jsonb',
    default: () => `'{}'`,
  })
  settings: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
