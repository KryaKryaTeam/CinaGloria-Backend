import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { UserSchema } from 'src/schemas/User.schema';
import { AuthorizationProviderMapper } from './AuthorizationProviderMapper';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';

@Injectable({ scope: Scope.DEFAULT })
export class UserMapper extends Mapper<UserSchema, UserEntity> {
  constructor(
    @Inject(MapperTokens.AuthorizationProviderMapper)
    private AuthProviderMapper: AuthorizationProviderMapper,
  ) {
    super();
  }
  public toEntity(schema: UserSchema): UserEntity {
    return new UserEntity({
      id: schema.id,
      role: schema.role,
      authorizationProvider: schema.authorizationProviders.map((schema) =>
        this.AuthProviderMapper.toEntity(schema),
      ),
      avatarUrl: schema.avatarUrl,
      email: schema.email,
      username: schema.username,
      additionalData: {
        age: schema.age,
        discord: schema.discord,
        firstName: schema.firstName,
        lastName: schema.lastName,
        surName: schema.surName,
        telegram: schema.telegram,
      },
    });
  }
  public toSchema(entity: UserEntity): UserSchema {
    const user = new UserSchema();
    user.id = entity.id;
    user.email = entity.email;
    user.username = entity.username;
    user.authorizationProviders = entity.authorizationProviders.map((ent) =>
      this.AuthProviderMapper.toSchema(ent),
    );
    user.discord = entity.additionalData.discord;
    user.telegram = entity.additionalData.telegram;
    user.age = entity.additionalData.age;
    user.firstName = entity.additionalData.firstName;
    user.lastName = entity.additionalData.lastName;
    user.surName = entity.additionalData.surName;
    user.role = entity.role;
    return user;
  }
}
