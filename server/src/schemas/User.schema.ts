import { RoleEnum } from '../types/RoleEnum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'avatar_url', default: 'https://....' })
  avatarUrl: string;

  // Additional data for autofill
  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'sur_name', nullable: true })
  surName: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  // Role
  @Column({ enum: RoleEnum, enumName: 'Role', default: RoleEnum.USER })
  role: RoleEnum;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
