import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAvatarCommand } from './UpdateAvatarCommand';
import { BaseTokens, ReposTokens } from 'src/common/Tokens';
import { DomainError } from 'src/error/DomainError';
import { createMockDBContext } from 'src/common/application/IDcontext.spec';
import { createMockEventDispatcher } from 'src/common/application/events/EventDispatcher';

describe('UpdateAvatarCommand', () => {
  let command: UpdateAvatarCommand;

  // Мок репозиторію
  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAvatarCommand,
        {
          provide: ReposTokens.UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: BaseTokens.DBContext,
          useValue: createMockDBContext(),
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: createMockEventDispatcher(),
        },
      ],
    }).compile();

    command = module.get<UpdateAvatarCommand>(UpdateAvatarCommand);
    jest.clearAllMocks();
  });

  it('should update avatar and save user when data is valid', async () => {
    const userId = 'user-123';
    const newAvatarStr = 'https://cdn.image.com/new-avatar.png';

    // Створюємо мок сутності з методом changeAvatarURL
    const mockUserEntity = {
      id: userId,
      changeAvatarURL: jest.fn(),
    };

    mockUserRepository.findById.mockResolvedValue(mockUserEntity);

    await command.implementation({ id: userId, avatar: newAvatarStr });

    // 1. Перевіряємо, чи знайшли юзера
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);

    // 2. Перевіряємо, чи викликано метод сутності з правильним Value Object
    // Ми використовують expect.any(AvatarURL) або перевіряємо значення всередині
    expect(mockUserEntity.changeAvatarURL).toHaveBeenCalledWith(
      expect.objectContaining({ value: newAvatarStr }),
    );

    // 3. Перевіряємо збереження
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserEntity);
  });

  it('should throw DomainError if avatar URL is invalid', async () => {
    const userId = 'user-123';
    const invalidAvatar = 'not-a-url'; // AvatarURL.create кине помилку

    mockUserRepository.findById.mockResolvedValue({ id: userId });

    // Оскільки AvatarURL.create(data.avatar) викликається всередині,
    // він має викинути помилку до того, як дійде до збереження
    await expect(
      command.implementation({ id: userId, avatar: invalidAvatar }),
    ).rejects.toThrow(DomainError);

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      command.implementation({ id: 'none', avatar: 'https://valid.url' }),
    ).rejects.toThrow();
  });
});
