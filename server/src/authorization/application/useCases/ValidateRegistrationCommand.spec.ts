import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BaseTokens, ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { BadRequestException } from '@nestjs/common';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { ValidateRegistrationCommand } from './ValidateRegistrationCommand';
import { Cache } from '@nestjs/cache-manager';

describe('ValidateRegistrationCommand', () => {
  let command: ValidateRegistrationCommand;

  const mockCache = {
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockUserRepository = {
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEventDispatcher = createMockEventDispatcher();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateRegistrationCommand,
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: ReposTokens.UserRepository, useValue: mockUserRepository },
        { provide: ServiceTokens.JWTService, useValue: mockJwtService },
        { provide: BaseTokens.EventDispatcher, useValue: mockEventDispatcher },
        { provide: BaseTokens.DBContext, useValue: createMockDBContext() },
      ],
    }).compile();

    command = await module.resolve<ValidateRegistrationCommand>(
      ValidateRegistrationCommand,
    );
  });

  it('should throw BadRequestException if requestId not found in cache', async () => {
    mockCache.get.mockResolvedValue(null);

    await expect(
      command.implementation({ requestId: 'id', code: '123456' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if code is incorrect', async () => {
    mockCache.get.mockResolvedValue({
      code: '111111',
      user: { id: 'uuid' }, // спрощена структура
    });

    await expect(
      command.implementation({ requestId: 'id', code: '222222' }),
    ).rejects.toThrow('Validation code is incorrect');
  });

  it('should successfully validate, save user and return tokens', async () => {
    const mockUserData = { id: 'uuid', email: 'test@test.com', events: [] }; // валідний IUserEntityJSON
    mockCache.get.mockResolvedValue({
      code: '123456',
      user: mockUserData,
    });

    // Мокаємо статичний метод load, щоб він повернув екземпляр з методами
    const mockUserInstance = {
      id: 'uuid',
      role: 'USER',
      pullEvents: jest.fn(),
    };
    jest.spyOn(UserEntity, 'load').mockReturnValue(mockUserInstance as any);

    mockJwtService.sign.mockReturnValue({
      accessToken: 'at',
      refreshToken: 'rt',
    });

    const result = await command.implementation({
      requestId: 'id',
      code: '123456',
    });

    expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserInstance);
    expect(mockUserInstance.pullEvents).toHaveBeenCalled();
    expect(mockCache.del).toHaveBeenCalledWith('registration:id');
  });
});
