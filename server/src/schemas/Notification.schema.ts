import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSchema } from './User.schema';
import { NotificationStatus } from '../types/NotificationStatus';

@Entity({ name: 'notification' })
export class NotificationSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ update: false, nullable: false })
  title: string;

  @Column({ update: false, nullable: false })
  content: string;

  @Column({ update: false, nullable: false })
  from: string;

  @ManyToOne(() => UserSchema, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  to: UserSchema;

  @Column({ enum: NotificationStatus, default: NotificationStatus.sended })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
