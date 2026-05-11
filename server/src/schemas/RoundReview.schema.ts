import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScoreSchema } from './Score.schema';
import { RoundSchema } from './Round.schema';
import { SubmitionSchema } from './Submition.schema';

@Entity('round-review')
export class RoundReviewSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  summary: number;

  @Column()
  description: string;

  @Column({ type: 'uuid' })
  byJury: string;

  @ManyToOne(() => RoundSchema)
  @JoinColumn()
  round: RoundSchema;

  @OneToOne(() => ScoreSchema)
  relatedScores: ScoreSchema[];

  @OneToMany(() => SubmitionSchema, (submission) => submission.review)
  submission: SubmitionSchema;
}
