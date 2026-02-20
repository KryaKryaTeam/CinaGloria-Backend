import { Injectable, Scope } from '@nestjs/common';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { Mapper } from 'src/common/infrastructure/Mapper';
import {
  AuthorizationProvider,
  AuthorizationProviderGithub,
  AuthorizationProviderGoogle,
  AuthorizationProviderLocal,
} from 'src/schemas/AuthorizationProvider.schema';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

@Injectable({ scope: Scope.REQUEST })
export class AuthorizationProviderMapper extends Mapper<
  AuthorizationProvider,
  AuthProviderEntity
> {
  public toEntity(schema: AuthorizationProvider): AuthProviderEntity {
    let passwordHash: string | undefined;
    let providerId: string | undefined;

    if (schema instanceof AuthorizationProviderLocal) {
      passwordHash = schema.passwordHash;
    } else if (
      schema instanceof AuthorizationProviderGoogle ||
      schema instanceof AuthorizationProviderGithub
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

    provider.id = entity.id;
    provider.type = entity.type;

    if (entity.type == AuthorizationProviderTypes.LOCAL) {
      (provider as AuthorizationProviderLocal).passwordHash =
        entity.getPasswordHash();
    } else {
      (
        provider as AuthorizationProviderGithub | AuthorizationProviderGoogle
      ).providerId = entity.getProviderId();
    }

    return provider;
  }
}
