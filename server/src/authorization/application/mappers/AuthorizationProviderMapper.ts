import { Injectable } from '@nestjs/common';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { Mapper } from 'src/common/infrastructure/Mapper';
import { AuthorizationProvider } from 'src/schemas/AuthorizationProvider.schema';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

@Injectable()
export class AuthorizationProviderMapper extends Mapper<
  AuthorizationProvider,
  AuthProviderEntity
> {
  public toEntity(schema: AuthorizationProvider): AuthProviderEntity {
    let passwordHash: string | undefined;
    let providerId: string | undefined;

    if (schema.type == AuthorizationProviderTypes.LOCAL) {
      passwordHash = schema.passwordHash;
    } else if (
      schema.type == AuthorizationProviderTypes.GITHUB ||
      schema.type == AuthorizationProviderTypes.GOOGLE
    ) {
      providerId = schema.providerId;
    }

    return new AuthProviderEntity({
      id: schema.id,
      type: schema.type,
      passwordHash: passwordHash!,
      providerId: providerId!,
    });
  }
  public toSchema(entity: AuthProviderEntity): AuthorizationProvider {
    const provider = new AuthorizationProvider();

    if (entity.isType(AuthorizationProviderTypes.LOCAL)) {
      provider.passwordHash = entity.getPasswordHash();
    } else {
      provider.providerId = entity.getProviderId();
    }
    provider.type = entity.type;
    provider.id = entity.id;

    console.log(provider);

    return provider;
  }
}
