import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FileSchema } from './File.schema';
import { UserSchema } from './User.schema';

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
}
