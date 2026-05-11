import { UserEntity } from './User.entity';
import { Username } from '../objects/Username.object';
import { RoleEnum } from 'src/types/RoleEnum';
import {
  createMockEventDispatcher,
  EventDispatcher,
} from 'src/common/application/events/EventDispatcher';
import { UserCreated } from '../events/UserCreated.event';
import { RegisterEvent } from 'src/common/domain/EventRegister';
import { AuthProviderEntity } from './AuthProvider.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { Event } from 'src/common/domain/Event';
import { ApiError } from 'src/error/ApiError';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { randomUUID } from 'crypto';
import { RelationSlots } from 'src/types/RelationSlots';

// Реєструємо івент для тестів регідрації
RegisterEvent(UserCreated);

describe('UserEntity', () => {
  const validEmail = 'dev@cinagloria.com';
  const validUsername = Username.create('code_runner_777');
  const validAvatar = InternalFile.define<typeof RelationSlots.user.avatar>(
    `internal_file:${randomUUID()}.webp`,
    'user:avatar',
    'user:avatar',
  );

  const eventDispatcher = new EventDispatcher();

  const createDefaultUser = () =>
    UserEntity.create(validEmail, validUsername, validAvatar);

  describe('Creation', () => {
    it('should correctly initialize a new user', () => {
      const user = createDefaultUser();

      user.pullEvents(eventDispatcher);

      expect(user.email).toBe(validEmail);
      expect(user.role).toBe(RoleEnum.USER);
      expect(user.username.value).toBe('code_runner_777');
      expect(eventDispatcher.getEventsCount()).toBe(1);
    });
  });

  describe('Role Management', () => {
    it('should allow admin to change user role', () => {
      const user = createDefaultUser();
      const admin = createDefaultUser();
      admin.__forceSetRole(RoleEnum.ADMIN);

      user.setRoleTo(admin, RoleEnum.ORGANIZER);
      expect(user.role).toBe(RoleEnum.ORGANIZER);
    });

    it('should throw error if non-admin tries to change role', () => {
      const user = createDefaultUser();
      const nonAdmin = createDefaultUser();

      expect(() => user.setRoleTo(nonAdmin, RoleEnum.ADMIN)).toThrow(ApiError);
    });

    it('should throw error if role is already set to the same value', () => {
      const user = createDefaultUser();
      const admin = createDefaultUser();
      admin.__forceSetRole(RoleEnum.ADMIN);

      expect(() => user.setRoleTo(admin, RoleEnum.USER)).toThrow(ApiError);
    });
  });

  describe('Username Modification', () => {
    const checkUniqueTrue = jest.fn().mockResolvedValue(true);
    const checkUniqueFalse = jest.fn().mockResolvedValue(false);

    it('should change username if valid and unique', async () => {
      const user = createDefaultUser();
      await user.changeUsername('new_valid_username', checkUniqueTrue);
      expect(user.username.value).toBe('new_valid_username');
    });

    it('should throw error if username is too short', async () => {
      const user = createDefaultUser();
      await expect(
        user.changeUsername('short', checkUniqueTrue),
      ).rejects.toThrow(ApiError);
    });

    it('should throw error if username starts with underscore', async () => {
      const user = createDefaultUser();
      await expect(
        user.changeUsername('_invalid_start', checkUniqueTrue),
      ).rejects.toThrow(ApiError);
    });

    it('should throw error if username is not unique', async () => {
      const user = createDefaultUser();
      await expect(
        user.changeUsername('already_taken', checkUniqueFalse),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Additional Data & Profile', () => {
    it('should correctly calculate fullName', () => {
      const user = createDefaultUser();
      user.additionalData = {
        firstName: 'John',
        lastName: 'Doe',
        surName: 'Junior',
      };
      expect(user.fullName).toBe('John Doe Junior');
    });

    it('should throw error if telegram does not start with @', () => {
      const user = createDefaultUser();
      expect(() => {
        user.additionalData = { telegram: 'john_doe' };
      }).toThrow(ApiError);
    });

    it('should throw error if trying to change birthDay after it was set', () => {
      const user = createDefaultUser();
      user.additionalData = { birthDay: new Date('1990-01-01') };

      expect(() => {
        user.additionalData = { birthDay: new Date('1991-01-01') };
      }).toThrow(ApiError);
    });

    it('should return isProfileFull correctly', () => {
      const user = createDefaultUser();
      expect(user.isProfileFull).toBe(false);

      user.additionalData = {
        firstName: 'John',
        lastName: 'Doe',
        telegram: '@john',
        discord: 'john#1234',
        birthDay: new Date('1995-05-05'),
      };

      expect(user.isProfileFull).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should throw error if password is weak', () => {
      const user = createDefaultUser();
      // Немає великої літери, цифр та символів
      expect(() => user.changePassword('weakpass')).toThrow(ApiError);
    });

    it('should throw error if LOCAL provider is missing', () => {
      const user = createDefaultUser();
      // Пароль сильний: Велика літера, цифра, символ, 8+ знаків
      expect(() => user.changePassword('StrongPass123!')).toThrow(ApiError);
    });
  });
  describe('UserEntity - Extended Tests', () => {
    const validEmail = 'dev@cinagloria.com';
    const validUsername = Username.create('code_runner_777');
    const validAvatar = InternalFile.define<typeof RelationSlots.user.avatar>(
      `internal_file:${randomUUID()}.webp`,
      'user:avatar',
      'user:avatar',
    );

    const createDefaultUser = () =>
      UserEntity.create(validEmail, validUsername, validAvatar);

    // --- Існуючі тести (Creation, Role Management, etc.) залишаються без змін ---

    describe('Serialization & Rehydration (toJSON & load)', () => {
      it('should correctly serialize to JSON and reload to Entity', () => {
        const user = createDefaultUser();
        user.additionalData = {
          firstName: 'Neo',
          telegram: '@matrix',
          birthDay: new Date('1999-03-31'),
        };

        // 1. Серіалізація
        const json = user.toJSON();

        expect(json.email).toBe(validEmail);
        expect(json.username).toBe('code_runner_777');
        expect(json.firstName).toBe('Neo');
        expect(json.contact.telegram).toBe('@matrix');
        // Перевіряємо, чи івент UserCreated потрапив у JSON
        expect(json.events).toContainEqual(
          expect.objectContaining({ eventType: 'UserCreated' }),
        );

        // 2. Регідрація (відновлення)
        const reloadedUser = UserEntity.load(json);

        expect(reloadedUser).toBeInstanceOf(UserEntity);
        expect(reloadedUser.id).toBe(user.id);
        expect(reloadedUser.email).toBe(user.email);
        expect(reloadedUser.username.value).toBe(user.username.value);
        expect(reloadedUser.additionalData.firstName).toBe('Neo');

        // Перевіряємо, чи методи працюють після відновлення
        expect(reloadedUser.fullName).toBe('Neo');
      });

      it('should rehydrate events correctly as class instances', () => {
        const user = createDefaultUser(); // Тут автоматично додається UserCreated
        const json = user.toJSON();

        const reloadedUser = UserEntity.load(json);

        const events =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          (reloadedUser as any).events as unknown as Event<unknown>[];

        expect(events.length).toBeGreaterThan(0);
        expect(events[0]).toBeInstanceOf(UserCreated);

        // Створюємо мок-диспетчер для перевірки типів івентів
        const mockDispatcher = createMockEventDispatcher();

        reloadedUser.pullEvents(mockDispatcher as any);
      });

      it('should handle missing optional additional data during load', () => {
        const user = createDefaultUser();
        const json = user.toJSON();

        // Імітуємо відсутність деяких полів у JSON (наприклад, старі дані в БД)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete (json as any).firstName;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (json as any).contact.telegram = '';

        const reloadedUser = UserEntity.load(json);
        expect(reloadedUser.additionalData.firstName).toBe(undefined);
        expect(reloadedUser.additionalData.telegram).toBe('');
      });
    });

    describe('AuthProvider Integration', () => {
      it('should correctly link a new provider', async () => {
        const user = createDefaultUser();
        const mockProvider = new AuthProviderEntity({
          id: 'p1',
          type: AuthorizationProviderTypes.GOOGLE,
          providerId: 'google-id-123',
          passwordHash: undefined,
        });
        const checkUnique = jest.fn().mockResolvedValue(true);

        await user.linkProvider(mockProvider, checkUnique);

        expect(user.authorizationProviders.length).toBe(1);
        expect(
          user.hasAuthorizationProvider(AuthorizationProviderTypes.GOOGLE),
        ).toBe(true);
      });

      it('should throw error when linking duplicate provider type', async () => {
        const user = createDefaultUser();
        const provider1 = new AuthProviderEntity({
          id: 'p1',
          type: AuthorizationProviderTypes.LOCAL,
          passwordHash: 'hash',
          providerId: undefined,
        });
        const checkUnique = jest.fn().mockResolvedValue(true);

        // Перший раз додаємо вручну (або через маніпуляцію, бо в конструкторі порожньо)
        (
          user as unknown as { _authorizationProviders: AuthProviderEntity[] }
        )._authorizationProviders.push(provider1);

        await expect(user.linkProvider(provider1, checkUnique)).rejects.toThrow(
          'This user already has provider with this type!',
        );
      });
    });

    describe('Complex Profile Getters', () => {
      it('should return correct privateProfile structure', () => {
        const user = createDefaultUser();
        user.additionalData = {
          firstName: 'John',
          lastName: 'Doe',
          birthDay: new Date('2000-01-01'),
        };

        const profile = user.privateProfile;
        expect(profile.fullName?.value).toBe('John Doe');
        expect(profile.age?.value).toBeGreaterThan(20); // Залежить від поточної дати
        expect(Array.isArray(profile.authorizationProviders)).toBe(true);
      });
    });
  });
});
