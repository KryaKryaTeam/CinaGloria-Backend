import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoundSchema } from './Round.schema';
import { SubmitionSchema } from './Submition.schema';

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

  @ManyToOne(() => RoundSchema, (round) => round.relatedTasks)
  round: RoundSchema;

  @ManyToOne(() => SubmitionSchema, (submition) => submition.relatedTasks, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  submition: SubmitionSchema;
}
