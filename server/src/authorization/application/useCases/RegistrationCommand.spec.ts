/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationCommand } from './RegistrationCommand';
import { BaseTokens, ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { BadRequestException } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';

describe('RegistrationCommand', () => {
  let command: RegistrationCommand;

  const mockUserRepository = {
    existsByEmail: jest.fn(),
  };

  const mockAuthProviderService = {
    authorize: jest.fn(),
  };

  const mockCacheService = {
    set: jest.fn(),
  };

  const mockEventDispatcher = createMockEventDispatcher();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationCommand,
        { provide: ReposTokens.UserRepository, useValue: mockUserRepository },
        {
          provide: ServiceTokens.AuthorizationProviderService,
          useValue: mockAuthProviderService,
        },
        {
          provide: BaseTokens.DBContext,
          useValue: createMockDBContext(),
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: mockEventDispatcher,
        },
        { provide: ServiceTokens.JWTService, useValue: {} },
        { provide: Cache, useValue: mockCacheService },
      ],
    }).compile();

    command = await module.resolve<RegistrationCommand>(RegistrationCommand);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should throw BadRequestException if provider type is not LOCAL', async () => {
      const data = { type: AuthorizationProviderTypes.GOOGLE, loginData: {} };

      await expect(command.implementation(data as any)).rejects.toThrow(
        new BadRequestException('This endpoint service only Local Provider'),
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      const data = {
        type: AuthorizationProviderTypes.LOCAL,
        loginData: { email: 'exists@test.com' },
      };
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(command.implementation(data as any)).rejects.toThrow(
        new BadRequestException('User with this email is already exists'),
      );
    });
  });

  describe('Execution Flow', () => {
    it('should successfully initiate registration and store data in cache', async () => {
      const loginData = { email: 'new@test.com', password: 'Password123!' };
      const data = { type: AuthorizationProviderTypes.LOCAL, loginData };

      // Імітуємо повернення UserEntity (або його plain версії)
      const mockUser = {
        id: 'user-uuid',
        email: loginData.email,
        toJSON: jest
          .fn()
          .mockReturnValue({ id: 'user-uuid', email: loginData.email }),
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockAuthProviderService.authorize.mockResolvedValue({ user: mockUser });
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await command.implementation(data as any);

      // 1. Перевірка requestId (UUID v4)
      expect(result.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );

      // 2. Перевірка виклику кешу
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining(`registration:${result.requestId}`),
        expect.objectContaining({
          user: mockUser.toJSON(),
          code: expect.stringMatching(/^\d{6}$/) as boolean,
        }),
        900000, // 15 хвилин
      );

      // 3. Перевірка подій
      expect(mockEventDispatcher.addEvent).toHaveBeenCalledWith(
        expect.any(SendNotificationEvent),
      );
    });

    it('should generate a valid 6-digit numeric string code', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockAuthProviderService.authorize.mockResolvedValue({
        user: { id: '1', toJSON: jest.fn().mockReturnValue({ id: '1' }) },
      });

      await command.implementation({
        type: AuthorizationProviderTypes.LOCAL,
        loginData: { email: 'test@test.com' },
      } as any);

      // Дістаємо аргументи з першого виклику cache.set
      const cacheValue = mockCacheService.set.mock.calls[0][1];
      const code = cacheValue.code;

      expect(code).toHaveLength(6);
      expect(/^\d+$/.test(code)).toBe(true);

      const numCode = parseInt(code, 10);
      expect(numCode).toBeGreaterThanOrEqual(100000);
      expect(numCode).toBeLessThanOrEqual(999999);
    });
  });

  describe('Event Content', () => {
    it('should include the generated code in the notification content', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockAuthProviderService.authorize.mockResolvedValue({
        user: {
          email: 'test@test.com',
          toJSON: jest.fn().mockReturnValue({ email: 'test@test.com' }),
        },
      });

      await command.implementation({
        type: AuthorizationProviderTypes.LOCAL,
        loginData: { email: 'test@test.com' },
      } as any);

      const cacheValue = mockCacheService.set.mock.calls[0][1];
      const generatedCode = cacheValue.code;

      // Перевіряємо, що в подію передано саме той код, що пішов у кеш
      const sentEvent = mockEventDispatcher.addEvent.mock
        .calls[0][0] as SendNotificationEvent;
      expect((sentEvent as any).payload.content).toContain(generatedCode);
    });
  });
});
