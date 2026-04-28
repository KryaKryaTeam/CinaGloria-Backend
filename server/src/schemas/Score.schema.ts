import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'score' })
export class ScoreSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  score: number;

  @Column()
  team: string;

  @ManyToOne(() => TaskEntity)
  task: TaskEntity;
}
