import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationProviderMapper } from './AuthorizationProviderMapper';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { AuthorizationProvider } from 'src/schemas/AuthorizationProvider.schema';

describe('AuthorizationProviderMapper', () => {
  let mapper: AuthorizationProviderMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationProviderMapper],
    }).compile();

    mapper = module.get<AuthorizationProviderMapper>(
      AuthorizationProviderMapper,
    );
  });

  describe('toEntity', () => {
    it('should map a LOCAL schema to a LOCAL entity with passwordHash', () => {
      const schema = {
        id: 'uuid-1',
        type: AuthorizationProviderTypes.LOCAL,
        passwordHash: 'hashed_password',
        providerId: undefined,
      } as AuthorizationProvider;

      const entity = mapper.toEntity(schema);

      expect(entity).toBeInstanceOf(AuthProviderEntity);
      expect(entity.type).toBe(AuthorizationProviderTypes.LOCAL);
      expect(entity.getPasswordHash()).toBe('hashed_password');
    });

    it('should map a GOOGLE schema to an entity with providerId', () => {
      const schema = {
        id: 'uuid-2',
        type: AuthorizationProviderTypes.GOOGLE,
        providerId: 'google-sub-123',
        passwordHash: undefined,
      } as AuthorizationProvider;

      const entity = mapper.toEntity(schema);

      expect(entity.type).toBe(AuthorizationProviderTypes.GOOGLE);
      expect(entity.getProviderId()).toBe('google-sub-123');
    });
  });

  describe('toSchema', () => {
    it('should map a LOCAL entity back to a schema correctly', () => {
      const entity = new AuthProviderEntity({
        id: 'uuid-1',
        type: AuthorizationProviderTypes.LOCAL,
        passwordHash: 'secret_hash',
        providerId: '',
      });

      const schema = mapper.toSchema(entity);

      expect(schema.id).toBe('uuid-1');
      expect(schema.type).toBe(AuthorizationProviderTypes.LOCAL);
      expect(schema.passwordHash).toBe('secret_hash');
      expect(schema.providerId).toBeUndefined();
    });

    it('should map an OAUTH entity back to a schema correctly', () => {
      const entity = new AuthProviderEntity({
        id: 'uuid-2',
        type: AuthorizationProviderTypes.GITHUB,
        providerId: 'github-user-88',
        passwordHash: '',
      });

      const schema = mapper.toSchema(entity);

      expect(schema.type).toBe(AuthorizationProviderTypes.GITHUB);
      expect(schema.providerId).toBe('github-user-88');
      expect(schema.passwordHash).toBeUndefined();
    });
  });
});
