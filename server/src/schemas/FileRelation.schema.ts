import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FileSchema } from './File.schema';
import { UserSchema } from './User.schema';
import { CompetitionSchema } from './Competition.schema';
import { TeamSchema } from './Team.schema';

@Entity({ name: 'file_relation' })
export class FileRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FileSchema, (file) => file.relations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_url' })
  file: FileSchema;

  @Column()
  slot: string;

  @ManyToOne(() => UserSchema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserSchema;

  @Column({ nullable: true })
  user_id?: string;

  @ManyToOne(() => CompetitionSchema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competition_id' })
  competition: CompetitionSchema;

  @Column({ nullable: true })
  competition_id?: string;

  @ManyToOne(() => TeamSchema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: TeamSchema;

  @Column({ nullable: true })
  team_id?: string;
}
