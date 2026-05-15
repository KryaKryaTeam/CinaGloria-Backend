import { Icons } from '../types/Icons';
import { RoundStatus } from '../types/RoundStatus';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetitionSchema } from './Competition.schema';
import { TaskSchema } from './Task.schema';
import { LeaderboardSchema } from './Leaderboard.schema';
import { SubmitionSchema } from './Submition.schema';
import { TeamSchema } from './Team.schema';

@Entity({ name: 'round' })
export class RoundSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  hidden: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Icons, default: Icons.CPU })
  icon: Icons;

  @Column({ type: 'timestamp with time zone' })
  startOfRound: Date;

  @Column({ type: 'timestamp with time zone' })
  taskTimeout: Date;

  @Column({ type: 'timestamp with time zone' })
  endOfRound: Date;

  @OneToMany(() => TaskSchema, (task) => task.round, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  relatedTasks: TaskSchema[];

  // fire engineering
  @Column({ type: 'enum', enum: RoundStatus, enumName: 'round_status' })
  status: RoundStatus;

  @ManyToOne(() => CompetitionSchema, (competition) => competition.rounds)
  competition: CompetitionSchema;

  @OneToOne(() => LeaderboardSchema, (leaderboard) => leaderboard.round, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  leaderboard: LeaderboardSchema;

  @OneToMany(() => SubmitionSchema, (submission) => submission.relatedRound, {
    nullable: true,
  })
  submissions?: SubmitionSchema[];

  @OneToMany(() => TeamSchema, (team) => team.round, { nullable: true })
  teams?: TeamSchema[];
}
