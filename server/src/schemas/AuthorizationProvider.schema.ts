import { AuthorizationProviderTypes } from '../types/AuthorizationProvidersTypes';
import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { UserSchema } from './User.schema';

@Entity()
@TableInheritance({
  column: { type: 'enum', enum: AuthorizationProviderTypes },
})
export class AuthorizationProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserSchema, (user) => user.authorizationProviders, {
    lazy: true,
  })
  @JoinColumn({ name: 'user_id' })
  userId: UserSchema;
}

@ChildEntity(AuthorizationProviderTypes.LOCAL) // email, password
export class AuthorizationProviderLocal extends AuthorizationProvider {
  @Column({ nullable: false, update: false })
  passwordHash: string;
}

@ChildEntity(AuthorizationProviderTypes.GOOGLE)
export class AuthorizationProviderGoogle extends AuthorizationProvider {
  @Column({ nullable: false, update: false })
  providerId: string;
}

@ChildEntity(AuthorizationProviderTypes.GITHUB)
export class AuthorizationProviderGithub extends AuthorizationProvider {
  @Column({ nullable: false, update: false })
  providerId: string;
}
