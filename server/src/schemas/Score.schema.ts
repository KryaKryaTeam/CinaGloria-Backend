import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskSchema } from './Task.schema';

@Entity({ name: 'score' })
export class ScoreSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  score: number;

  @Column()
  team: string;

  @ManyToOne(() => TaskSchema)
  task: TaskSchema;
}
