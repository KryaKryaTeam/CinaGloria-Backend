import { Icons } from '../types/Icons';
import { RoundStatus } from '../types/RoundStatus';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetitionSchema } from './Competition.schema';

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

  @Column({ type: 'timestamp with time zone', nullable: true })
  startOfRound: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endOfRound: Date | null;

  //   @Column({ type: 'jsonb', default: [] })
  //   relatedTasks: TaskSchema[];

  // fire engineering
  @Column({ type: 'enum', enum: RoundStatus, enumName: 'round_status' })
  status: RoundStatus;

  @ManyToOne(() => CompetitionSchema)
  @JoinColumn({ name: 'competition_id' })
  competition: CompetitionSchema;
}
