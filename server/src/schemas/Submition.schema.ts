import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoundSchema } from './Round.schema';
import { RoundReviewSchema } from './RoundReview.schema';
import { TeamSchema } from './Team.schema';

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

  @ManyToOne(() => RoundReviewSchema, (roundReview) => roundReview.submission, {
    nullable: true,
  })
  review?: RoundReviewSchema;

  @OneToOne(() => TeamSchema)
  @JoinColumn()
  team: TeamSchema;
}
