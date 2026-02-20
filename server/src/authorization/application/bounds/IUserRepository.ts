import { UserEntity } from 'src/authorization/domain/entities/User.entity';

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findById(userId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
}
