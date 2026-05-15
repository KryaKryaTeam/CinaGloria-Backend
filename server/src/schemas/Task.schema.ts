import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoundSchema } from './Round.schema';

@Entity({ name: 'task' })
export class TaskSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  color: string; // ????

  @JoinColumn()
  @ManyToOne(() => RoundSchema, (round) => round.relatedTasks)
  round: RoundSchema;
}
