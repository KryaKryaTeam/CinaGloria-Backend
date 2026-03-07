import { UserEntity } from './User.entity';
import { Username } from '../objects/Username.object';
import { AvatarURL } from '../objects/AvatarURL.object';
import { RoleEnum } from 'src/types/RoleEnum';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { EventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('UserEntity', () => {
  const validEmail = 'dev@cinagloria.com';
  const validUsername = Username.create('code_runner_777');
  const validAvatar = AvatarURL.create('https://avatar.com/1.png');

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
      Object.assign(admin, { _role: RoleEnum.ADMIN });

      user.setRoleTo(admin, RoleEnum.ORGANIZER);
      expect(user.role).toBe(RoleEnum.ORGANIZER);
    });

    it('should throw error if non-admin tries to change role', () => {
      const user = createDefaultUser();
      const nonAdmin = createDefaultUser();

      expect(() => user.setRoleTo(nonAdmin, RoleEnum.ADMIN)).toThrow(
        new DomainError(DomainErrors.RESTRICTED_CHANGE),
      );
    });

    it('should throw error if role is already set to the same value', () => {
      const user = createDefaultUser();
      const admin = createDefaultUser();
      Object.assign(admin, { _role: RoleEnum.ADMIN });

      expect(() => user.setRoleTo(admin, RoleEnum.USER)).toThrow(
        new DomainError(DomainErrors.NO_CHANGE),
      );
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
      ).rejects.toThrow(DomainErrors.RESTRICTED_CHANGE);
    });

    it('should throw error if username starts with underscore', async () => {
      const user = createDefaultUser();
      await expect(
        user.changeUsername('_invalid_start', checkUniqueTrue),
      ).rejects.toThrow(DomainErrors.RESTRICTED_CHANGE);
    });

    it('should throw error if username is not unique', async () => {
      const user = createDefaultUser();
      await expect(
        user.changeUsername('already_taken', checkUniqueFalse),
      ).rejects.toThrow(DomainErrors.DUPLICATION);
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
      }).toThrow(DomainErrors.RESTRICTED_CHANGE);
    });

    it('should throw error if trying to change birthDay after it was set', () => {
      const user = createDefaultUser();
      user.additionalData = { birthDay: new Date('1990-01-01') };

      expect(() => {
        user.additionalData = { birthDay: new Date('1991-01-01') };
      }).toThrow(DomainErrors.IMMUTABLE_VALUE);
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
      expect(() => user.changePassword('weakpass')).toThrow(
        DomainErrors.RESTRICTED_CHANGE,
      );
    });

    it('should throw error if LOCAL provider is missing', () => {
      const user = createDefaultUser();
      // Пароль сильний: Велика літера, цифра, символ, 8+ знаків
      expect(() => user.changePassword('StrongPass123!')).toThrow(
        DomainErrors.UNEXPECTED_VALUE,
      );
    });
  });
});
