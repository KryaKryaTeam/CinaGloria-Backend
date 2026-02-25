import { RoleEnum } from '../types/RoleEnum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthorizationProvider } from './AuthorizationProvider.schema';

@Entity({ name: 'user' })
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'avatar_url', default: 'https://....' })
  avatarUrl: string;

  @Column({ name: 'telegram', nullable: true })
  telegram?: string;

  @Column({ name: 'discord', nullable: true })
  discord?: string;

  // Additional data for autofill
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'sur_name', nullable: true })
  surName?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

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
}
