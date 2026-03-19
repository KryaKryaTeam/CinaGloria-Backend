import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from './UserMapper';
import { MapperTokens } from 'src/common/Tokens';
import { UserSchema } from 'src/schemas/User.schema';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { RoleEnum } from 'src/types/RoleEnum';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { AuthProviderEntity } from 'src/authorization/domain/entities/AuthProvider.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';

describe('UserMapper', () => {
  let mapper: UserMapper;

  // Створюємо мок для вкладеного мапера
  const mockAuthProviderMapper = {
    toEntity: jest.fn(),
    toSchema: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMapper,
        {
          provide: MapperTokens.AuthorizationProviderMapper,
          useValue: mockAuthProviderMapper,
        },
      ],
    }).compile();

    mapper = module.get<UserMapper>(UserMapper);
    jest.clearAllMocks();
  });

  describe('toEntity', () => {
    it('should correctly map UserSchema to UserEntity', () => {
      const schema: Partial<UserSchema> = {
        id: 'user-uuid',
        email: 'test@hex.com',
        username: 'valid_username',
        avatarUrl: 'internal_file:avatar.io/pic.png',
        role: RoleEnum.USER,
        authorizationProviders: [{ id: 'auth-1' } as any],
        telegram: '@handle',
        birthDay: new Date('1990-01-01'),
      };

      mockAuthProviderMapper.toEntity.mockReturnValue({ id: 'auth-entity-1' });

      const entity = mapper.toEntity(schema as UserSchema);

      expect(entity).toBeInstanceOf(UserEntity);
      expect(entity.id).toBe(schema.id);
      expect(entity.username.value).toBe(schema.username);
      expect(entity.additionalData.telegram).toBe(schema.telegram);

      expect(mockAuthProviderMapper.toEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('toSchema', () => {
    it('should correctly map UserEntity to UserSchema', () => {
      const entity = new UserEntity({
        id: 'user-uuid',
        email: 'test@hex.com',
        _username: Username.create('valid_username'),
        _avatarUrl: InternalFile.define<typeof RelationSlots.user.avatar>(
          'internal_file:something',
          'user:avatar',
          'user:avatar',
        ),
        _role: RoleEnum.ADMIN,
        _authorizationProviders: [{ id: 'auth-ent' } as AuthProviderEntity],
        _additionalData: { telegram: '@bot' },
      });

      mockAuthProviderMapper.toSchema.mockReturnValue({ id: 'auth-schema-1' });

      const schema = mapper.toSchema(entity);

      expect(schema.id).toBe(entity.id);
      expect(schema.role).toBe(RoleEnum.ADMIN);
      expect(schema.username).toBe('valid_username');
      expect(schema.telegram).toBe('@bot');
      expect(schema.authorizationProviders[0].id).toBe('auth-schema-1');
    });
  });
});
