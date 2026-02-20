import { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { BaseRepository } from './BaseRepository';
import { UserSchema } from 'src/schemas/User.schema';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { UserMapper } from 'src/authorization/application/mappers/UserMapper';
import { Inject, Injectable } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';

@Injectable()
export class UserRepository
  extends BaseRepository<UserSchema>
  implements IUserRepository
{
  @Inject(MapperTokens.UserMapper)
  private userMapper: UserMapper;

  protected _entitySchema: new () => UserSchema;

  async findByEmail(email: string): Promise<UserEntity | null> {
    const res = await this.repository.findOne({ where: { email } });
    if (!res) return null;

    return this.userMapper.toEntity(res);
  }
  async findById(userId: string): Promise<UserEntity | null> {
    const res = await this.repository.findOne({ where: { id: userId } });
    if (!res) return null;

    return this.userMapper.toEntity(res);
  }
  async save(user: UserEntity): Promise<void> {
    await this.repository.save(this.userMapper.toSchema(user));
  }
}
