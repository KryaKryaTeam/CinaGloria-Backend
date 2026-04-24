import { Test, TestingModule } from '@nestjs/testing';
import { CreateSuperUserCommand } from 'src/authorization/application/useCases/CreateSuperUser.command';
import { ReposTokens, ServiceTokens } from 'src/common/Tokens';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { AvatarURL } from 'src/authorization/domain/objects/AvatarURL.object';
import { Username } from 'src/authorization/domain/objects/Username.object';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RoleEnum } from 'src/types/RoleEnum';
import { ConfigService } from '@nestjs/config';

// ─── Global fetch mock (it's a command, not a browser) ───────────────────────

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
  dispatch: jest.fn(),
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
      ],
    }).compile();

    command = module.get(CreateSuperUserCommand);
    (command as any).eventDispatcher = mockEventDispatcher;

    jest.clearAllMocks();

    // Default happy-path wiring
    mockUserRepository.existsByEmail.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);
    mockFileRepository.save.mockResolvedValue(undefined);
    mockLoadFileService.loadFile.mockResolvedValue(fakeFile);
    mockHashService.hash.mockReturnValue('hashed-password');
    mockLinkerService.linkAvatarToUser.mockResolvedValue(undefined);

    // Config returns dummy lists for avatar + username generation
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const map: Record<string, unknown> = {
        'avatar.list': ['https://avatar.example.com/1.png'],
        'username.animals': ['cat', 'dog'],
        'username.adjectives': ['fluffy', 'grumpy'],
      };
      return map[key];
    });

    // Static method mocks — we test domain entities elsewhere
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

  // ─── Guard: email already exists ─────────────────────────────────────────────

  describe('when email is already taken', () => {
    it('should throw USER_BY_THIS_EMAIL_IS_EXISTS', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });

    it('should never fetch an avatar or touch the db', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(command.execute(fakeInput)).rejects.toThrow();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─── Guard: avatar fetch goes sideways ───────────────────────────────────────

  describe('when avatar fetch fails', () => {
    it('should throw when response.ok is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        arrayBuffer: jest.fn(),
      });

      await expect(command.execute(fakeInput)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw when response has no arrayBuffer', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        arrayBuffer: null,
      });

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });

    it('should rethrow known errors (those with a code property) as-is', async () => {
      const knownError = { code: 404, message: 'upstream dead' };
      (global.fetch as jest.Mock).mockRejectedValue(knownError);

      await expect(command.execute(fakeInput)).rejects.toMatchObject({
        code: 404,
      });
    });

    it('should throw MISCONFIGURED for unknown errors without a code', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('network flipped a table'),
      );

      await expect(command.execute(fakeInput)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw MISCONFIGURED when loadFileService explodes without a code', async () => {
      mockLoadFileService.loadFile.mockRejectedValue(new Error('disk on fire'));

      await expect(command.execute(fakeInput)).rejects.toThrow();
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────────

  describe('when everything works', () => {
    it('should check if email exists', async () => {
      await command.execute(fakeInput);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        fakeInput.email,
      );
    });

    it('should fetch the generated avatar URL', async () => {
      await command.execute(fakeInput);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://avatar.example.com/1.png',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('should save the file entity', async () => {
      await command.execute(fakeInput);

      expect(mockFileRepository.save).toHaveBeenCalledWith(fakeFile);
    });

    it('should hash the password', async () => {
      await command.execute(fakeInput);

      expect(mockHashService.hash).toHaveBeenCalledWith(fakeInput.password);
    });

    it('should force admin role on the created user', async () => {
      await command.execute(fakeInput);

      expect(fakeUser.__forceSetRole).toHaveBeenCalledWith(RoleEnum.ADMIN);
    });

    it('should save the user', async () => {
      await command.execute(fakeInput);

      expect(mockUserRepository.save).toHaveBeenCalledWith(fakeUser);
    });

    it('should link the avatar to the user', async () => {
      await command.execute(fakeInput);

      expect(mockLinkerService.linkAvatarToUser).toHaveBeenCalledWith(
        fakeFile,
        fakeUser,
      );
    });

    it('should execute in the right order — file saved before user, user saved before linking', async () => {
      const order: string[] = [];

      mockFileRepository.save.mockImplementation(() => order.push('file:save'));
      fakeUser.__forceSetRole.mockImplementation(() => order.push('forceRole'));
      mockUserRepository.save.mockImplementation(() => order.push('user:save'));
      mockLinkerService.linkAvatarToUser.mockImplementation(() =>
        order.push('link'),
      );

      await command.execute(fakeInput);

      expect(order).toEqual(['file:save', 'forceRole', 'user:save', 'link']);
    });
  });
});
