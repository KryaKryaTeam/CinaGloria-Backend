import { Test, TestingModule } from '@nestjs/testing';
import { CreateSuperUserCommand } from 'src/authorization/application/useCases/CreateSuperUser.command';
import { ReposTokens, ServiceTokens, BaseTokens } from 'src/common/Tokens';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RoleEnum } from 'src/types/RoleEnum';
import { ConfigService } from '@nestjs/config';

// ─── Global fetch mock ───────────────────────────────────────────────────────

global.fetch = jest.fn();

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUserRepository = {
  existsByEmail: jest.fn(),
  save: jest.fn(),
};

const mockFileRepository = {
  save: jest.fn(),
};

const mockLoadFileService = {
  loadFile: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn(),
};

const mockHashService = {
  hash: jest.fn(),
};

const mockLinkerService = {
  linkAvatarToUser: jest.fn(),
};

const mockEventDispatcher = {
  dispatchEvents: jest.fn(),
  addEvent: jest.fn(),
};

const mockDBContext = {
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
};

// ─── Fake domain objects ──────────────────────────────────────────────────────

const fakeFile = { url: 'https://cdn.example.com/avatar.png' };

const fakeUser = {
  linkProvider: jest.fn().mockResolvedValue(undefined),
  __forceSetRole: jest.fn(),
  pullEvents: jest.fn(),
  id: 'user-uuid',
};

const fakeInput = {
  email: 'admin@example.com',
  password: 'super-secret',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeOkFetchResponse = (buffer = Buffer.from('fake-image')) => ({
  ok: true,
  arrayBuffer: jest.fn().mockResolvedValue(buffer),
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CreateSuperUserCommand', () => {
  let command: CreateSuperUserCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSuperUserCommand,

        { provide: ReposTokens.UserRepository, useValue: mockUserRepository },
        { provide: ReposTokens.FileRepository, useValue: mockFileRepository },

        {
          provide: ServiceTokens.LoadFileService,
          useValue: mockLoadFileService,
        },
        { provide: ServiceTokens.HashService, useValue: mockHashService },
        {
          provide: ServiceTokens.FileLinkerService,
          useValue: mockLinkerService,
        },

        { provide: ConfigService, useValue: mockConfigService },

        // 🔥 REQUIRED NEST DEPENDENCIES
        { provide: BaseTokens.DBContext, useValue: mockDBContext },
        { provide: BaseTokens.EventDispatcher, useValue: mockEventDispatcher },
      ],
    }).compile();

    command = module.get(CreateSuperUserCommand);

    jest.clearAllMocks();

    // manual override still OK for direct assertions
    (command as any).eventDispatcher = mockEventDispatcher;

    // Default happy-path wiring
    mockUserRepository.existsByEmail.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);
    mockFileRepository.save.mockResolvedValue(undefined);
    mockLoadFileService.loadFile.mockResolvedValue(fakeFile);
    mockHashService.hash.mockReturnValue('hashed-password');
    mockLinkerService.linkAvatarToUser.mockResolvedValue(undefined);

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const map: Record<string, unknown> = {
        'avatar.list': ['https://avatar.example.com/1.png'],
        'username.animals': ['cat', 'dog'],
        'username.adjectives': ['fluffy', 'grumpy'],
      };
      return map[key];
    });

    jest
      .spyOn(AvatarURL, 'generate')
      .mockReturnValue({ value: 'https://avatar.example.com/1.png' } as any);

    jest
      .spyOn(Username, 'generate')
      .mockReturnValue({ value: 'fluffy-cat' } as any);

    jest.spyOn(InternalFile, 'define').mockReturnValue({} as any);

    jest.spyOn(UserEntity, 'create').mockReturnValue(fakeUser as any);

    (global.fetch as jest.Mock).mockResolvedValue(makeOkFetchResponse());
  });

  // ─── Guards ────────────────────────────────────────────────────────────────

  describe('when email is already taken', () => {
    it('should throw USER_BY_THIS_EMAIL_IS_EXISTS', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });

    it('should never fetch or save', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(command.execute(fakeInput)).rejects.toThrow();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when avatar fetch fails', () => {
    it('should throw when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        arrayBuffer: jest.fn(),
      });

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });

    it('should throw when arrayBuffer missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: null,
      });

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });

    it('should throw unknown fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('boom'));

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });
  });

  // ─── Happy path ─────────────────────────────────────────────────────────────

  describe('when everything works', () => {
    it('should execute full flow', async () => {
      await command.execute(fakeInput);

      expect(mockDBContext.startTransaction).toHaveBeenCalled();
      expect(mockDBContext.commitTransaction).toHaveBeenCalled();

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        fakeInput.email,
      );

      expect(global.fetch).toHaveBeenCalled();

      expect(mockUserRepository.save).toHaveBeenCalledWith(fakeUser);

      expect(mockLinkerService.linkAvatarToUser).toHaveBeenCalled();

      expect(fakeUser.__forceSetRole).toHaveBeenCalledWith(RoleEnum.ADMIN);

      expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
    });
  });
});
