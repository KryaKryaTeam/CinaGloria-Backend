import { RoleEnum } from '../types/RoleEnum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthorizationProvider } from './AuthorizationProvider.schema';
import { NotificationSchema } from './Notification.schema';

@Entity({ name: 'user' })
export class UserSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'avatar_url', default: 'https://....' })
  avatarUrl: string;

  // Additional data for autofill

  @Column({ name: 'telegram', nullable: true })
  telegram?: string;

  @Column({ name: 'discord', nullable: true })
  discord?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'sur_name', nullable: true })
  surName?: string;

  @Column({ name: 'birth_day', type: 'date', nullable: true })
  birthDay?: Date;

  // Role
  @Column({ enum: RoleEnum, enumName: 'Role', default: RoleEnum.USER })
  role: RoleEnum;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  ///Relations
  @OneToMany(() => AuthorizationProvider, (provider) => provider.userId, {
    onDelete: 'CASCADE',
    eager: true,
    cascade: true,
  })
  authorizationProviders: AuthorizationProvider[];

  @OneToMany(() => NotificationSchema, (notification) => notification.to, {
    onDelete: 'CASCADE',
    eager: true,
    cascade: true,
  })
  notifications: NotificationSchema[];
}
