import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TaskSchema } from './Task.schema';

@Entity()
export class SubmitionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  createdAt: Date;

  @Column()
  githubURL: string;

  @Column()
  youtubeURL: string;

  @Column({ type: 'uuid' })
  assignedToJury: string;

  @OneToMany(() => TaskSchema, (task) => task.submition)
  relatedTasks: TaskSchema[];
}
