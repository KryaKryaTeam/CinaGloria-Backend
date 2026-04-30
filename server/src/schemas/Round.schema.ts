import { Icons } from '../types/Icons';
import { RoundStatus } from '../types/RoundStatus';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetitionSchema } from './Competition.schema';
import { TaskSchema } from './Task.schema';

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

  @OneToMany(() => TaskSchema, (task) => task.round, { onDelete: 'CASCADE' })
  relatedTasks: TaskSchema[];

  // fire engineering
  @Column({ type: 'enum', enum: RoundStatus, enumName: 'round_status' })
  status: RoundStatus;

  @ManyToOne(() => CompetitionSchema)
  @JoinColumn({ name: 'competition_id' })
  competition: CompetitionSchema;
}
