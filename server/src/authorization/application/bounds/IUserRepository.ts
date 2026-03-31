import { UserEntity } from 'src/authorization/domain/entities/User.entity';

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findById(userId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  getPageOfUsers(page: number): Promise<UserEntity[]>;
  getUsersWithSimillarEmailByPages(
    page: number,
    email: string,
  ): Promise<UserEntity[]>;
}
