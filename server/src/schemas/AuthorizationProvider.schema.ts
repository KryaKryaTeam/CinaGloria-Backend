import { AuthorizationProviderTypes } from '../types/AuthorizationProvidersTypes';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSchema } from './User.schema';

@Entity()
export class AuthorizationProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuthorizationProviderTypes,
    name: 'type', // Must match the name in TableInheritance
    readonly: true,
  })
  type: AuthorizationProviderTypes;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  providerId?: string;

  @ManyToOne(() => UserSchema, (user) => user.authorizationProviders, {
    lazy: true,
  })
  @JoinColumn({ name: 'user_id' })
  userId: UserSchema;
}
