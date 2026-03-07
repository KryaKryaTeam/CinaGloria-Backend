import { AuthProviderEntity } from './AuthProvider.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { IHashService } from 'src/authorization/application/bounds/IHashService';

describe('AuthProviderEntity', () => {
  const mockHashService: jest.Mocked<IHashService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  describe('Constructor Validation', () => {
    it('should create a LOCAL provider when passwordHash is provided', () => {
      const provider = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.LOCAL,
        passwordHash: 'hashed_password',
        providerId: '',
      });

      expect(provider.type).toBe(AuthorizationProviderTypes.LOCAL);
      expect(provider.getPasswordHash()).toBe('hashed_password');
    });

    it('should throw error if LOCAL provider has providerId', () => {
      expect(
        () =>
          new AuthProviderEntity({
            id: '2',
            type: AuthorizationProviderTypes.LOCAL,
            passwordHash: 'hash',
            providerId: 'external-id',
          }),
      ).toThrow(DomainError);
    });

    it('should create an OAUTH provider (e.g. GOOGLE) with providerId', () => {
      const provider = new AuthProviderEntity({
        id: '3',
        type: AuthorizationProviderTypes.GOOGLE,
        providerId: 'google-sub-123',
        passwordHash: '',
      });

      expect(provider.getProviderId()).toBe('google-sub-123');
    });

    it('should throw error if OAUTH provider has passwordHash', () => {
      expect(
        () =>
          new AuthProviderEntity({
            id: '4',
            type: AuthorizationProviderTypes.GITHUB,
            providerId: 'github-id',
            passwordHash: 'some-hash',
          }),
      ).toThrow(DomainError);
    });
  });

  describe('isDataEqual', () => {
    it('should use hashService for LOCAL provider comparison', () => {
      const provider = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.LOCAL,
        passwordHash: 'stored_hash',
        providerId: '',
      });

      mockHashService.compare.mockReturnValue(true);

      (mockHashService.compare as jest.Mock).mockReturnValue(true);

      const result = provider.isDataEqual('raw_password', mockHashService);

      expect(result).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockHashService.compare).toHaveBeenCalledWith(
        'raw_password',
        'stored_hash',
      );
    });

    it('should use direct comparison for OAUTH providers', () => {
      const provider = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.GOOGLE,
        providerId: 'google-123',
        passwordHash: '',
      });

      expect(provider.isDataEqual('google-123', mockHashService)).toBe(true);
      expect(provider.isDataEqual('wrong-id', mockHashService)).toBe(false);
    });
  });

  describe('Setters & Constraints', () => {
    it('should allow changing password only for LOCAL provider', () => {
      const local = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.LOCAL,
        passwordHash: 'old_hash',
        providerId: '',
      });

      local.setPasswordHash('new_hash');
      expect(local.getPasswordHash()).toBe('new_hash');
    });

    it('should throw when setting password on non-local provider', () => {
      const oauth = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.GITHUB,
        providerId: 'git-123',
        passwordHash: '',
      });

      expect(() => oauth.setPasswordHash('hash')).toThrow(
        DomainErrors.RESTRICTED_CHANGE,
      );
    });

    it('should throw if trying to overwrite existing providerId', () => {
      const oauth = new AuthProviderEntity({
        id: '1',
        type: AuthorizationProviderTypes.GITHUB,
        providerId: 'id-1',
        passwordHash: '',
      });

      expect(() => oauth.setProviderId('id-2')).toThrow(
        DomainErrors.IMMUTABLE_VALUE,
      );
    });
  });
});
