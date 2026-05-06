import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoundSchema } from './Round.schema';

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

  @Column({ type: 'uuid', nullable: true })
  @JoinColumn()
  assignedToJury?: string;

  @ManyToOne(() => RoundSchema, (round) => round.submission)
  relatedRound: RoundSchema;
}
