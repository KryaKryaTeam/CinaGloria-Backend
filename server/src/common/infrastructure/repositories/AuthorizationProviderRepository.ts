import { IAuthProviderRepository } from 'src/authorization/application/bounds/IAuthProviderRepository';
import { BaseRepository } from './BaseRepository';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { AuthorizationProvider } from 'src/schemas/AuthorizationProvider.schema';
import { Inject, Injectable } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { AuthorizationProviderMapper } from 'src/authorization/application/mappers/AuthorizationProviderMapper';

@Injectable()
export class AuthorizationProviderRepository
  extends BaseRepository<AuthorizationProvider>
  implements IAuthProviderRepository
{
  @Inject(MapperTokens.AuthorizationProviderMapper)
  private authProviderMapper: AuthorizationProviderMapper;

  protected _entitySchema: new () => AuthorizationProvider;
  async save(provider: AuthProviderEntity): Promise<void> {
    await this.repository.save(this.authProviderMapper.toSchema(provider));
  }
  async findBelongToUser(userId: string): Promise<AuthProviderEntity[] | null> {
    const res = await this.repository.find({
      where: { userId: { id: userId } },
    });

    if (!res) return null;

    return res.map((schema) => this.authProviderMapper.toEntity(schema));
  }
  async findById(providerId: string): Promise<AuthProviderEntity | null> {
    const res = await this.repository.findOneBy({ id: providerId });
    if (!res) return null;

    return this.authProviderMapper.toEntity(res);
  }
  async findByProviderId(
    providerId: string,
  ): Promise<AuthProviderEntity | null> {
    const res = await this.repository
      .createQueryBuilder()
      .where('provider.providerId = :id', { id: providerId })
      .getOne();

    if (!res) return null;

    return this.authProviderMapper.toEntity(res);
  }
}
