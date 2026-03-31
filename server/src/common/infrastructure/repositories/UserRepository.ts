import { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { BaseRepository } from './BaseRepository';
import { UserSchema } from 'src/schemas/User.schema';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';

export class UserRepository
  extends BaseRepository<UserSchema>
  implements IUserRepository
{
  @Inject(MapperTokens.UserMapper)
  private userMapper: UserMapper;

  protected _entitySchema = UserSchema;

  async findByEmail(email: string): Promise<UserEntity | null> {
    const res = await this.repository.findOne({
      where: { email },
    });
    if (!res) return null;

    return this.userMapper.toEntity(res);
  }
  async findById(userId: string): Promise<UserEntity | null> {
    const res = await this.repository.findOne({
      where: { id: userId },
    });
    if (!res) return null;

    return this.userMapper.toEntity(res);
  }
  async save(user: UserEntity): Promise<void> {
    await this.repository.save(this.userMapper.toSchema(user));
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.repository.exists({ where: { email } });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return await this.repository.exists({ where: { username } });
  }

  async getPageOfUsers(page: number): Promise<UserEntity[]> {
    return (await this.repository.find({ skip: 20 * page, take: 20 })).map(
      (el) => this.userMapper.toEntity(el),
    );
  }

  async getUsersWithSimillarEmailByPages(
    page: number,
    email: string,
  ): Promise<UserEntity[]> {
    const result = await this.repository
      .createQueryBuilder('user')
      .where('user.email ILIKE :pattern', { pattern: `%${email}%` })
      .orWhere('user.email % :input', { input: email })
      .orderBy(`similarity(user.email, :input)`, 'DESC')
      .skip(page * 20)
      .take(20)
      .getMany();
    if (!result || result.length == 0) return [];

    return result.map((el) => this.userMapper.toEntity(el));
  }
}
