// create-competition.command.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CreateCompetitionCommand } from './CreateCompetition.command';
import { ReposTokens, ServiceTokens, BaseTokens } from 'src/common/Tokens';
import { UserAndCompetitionService } from 'src/competitions/domain/services/UserAndCompetitionService';
import { CompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { Icons } from 'src/types/Icons';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFileRepository = {
  findByUrl: jest.fn(),
};

const mockCompetitionRepository = {
  save: jest.fn(),
};

const mockLinkerService = {
  linkFileToCompetitionSlot: jest.fn(),
};

const mockEventDispatcher = {
  dispatchEvents: jest.fn(),
};

const mockDBContext = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
};

// ─── Fake domain objects ──────────────────────────────────────────────────────

const makeComp = () => ({
  addRule: jest.fn(),
  avatar: undefined as any,
  banner: undefined as any,
  socialMedia: undefined as any,
  ultraWideBanner: undefined as any,
});

const fakeUser = { id: 'user-uuid', role: 'user' } as any;

const fakeFile = (url: string) => ({ url });

const baseCompetitionInput = {
  avatar: 'https://cdn.example.com/avatar',
  banner: 'https://cdn.example.com/banner',
  socialMedia: 'Instagram',
  ultraWideBanner: 'https://cdn.example.com/ultraWideBanner',
  rules: [],
  title: 'Test Cup',
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('CreateCompetitionCommand', () => {
  let command: CreateCompetitionCommand;
  let fakeComp: ReturnType<typeof makeComp>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompetitionCommand,
        { provide: ReposTokens.FileRepository, useValue: mockFileRepository },
        {
          provide: ReposTokens.CompetitionRepository,
          useValue: mockCompetitionRepository,
        },
        {
          provide: ServiceTokens.FileLinkerService,
          useValue: mockLinkerService,
        },
        {
          provide: BaseTokens.DBContext,
          useValue: mockDBContext,
        },
        {
          provide: BaseTokens.EventDispatcher,
          useValue: mockEventDispatcher,
        },
      ],
    }).compile();

    command = module.get(CreateCompetitionCommand);

    jest.clearAllMocks();

    fakeComp = makeComp();

    jest
      .spyOn(UserAndCompetitionService, 'createCompetition')
      .mockReturnValue(fakeComp as any);

    jest
      .spyOn(CompetitionRule, 'define')
      .mockImplementation((name, desc, icon) => ({ name, desc, icon }) as any);

    jest
      .spyOn(RelationString, 'define')
      .mockImplementation((slot) => slot as any);

    jest
      .spyOn(InternalFile, 'define')
      .mockImplementation((url) => ({ url }) as any);

    mockCompetitionRepository.save.mockResolvedValue(undefined);
    mockLinkerService.linkFileToCompetitionSlot.mockResolvedValue(undefined);
    mockFileRepository.findByUrl.mockResolvedValue(null);
  });

  // ─── Competition creation ─────────────────────────────────────────────────

  describe('competition creation', () => {
    it('should call UserAndCompetitionService.createCompetition stripping file fields', async () => {
      await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(UserAndCompetitionService.createCompetition).toHaveBeenCalledWith(
        expect.objectContaining({
          banner: undefined,
          avatar: undefined,
          socialMedia: undefined,
          ultraWideBanner: undefined,
          rules: [],
        }),
        fakeUser,
      );
    });

    it('should save the competition immediately after creation', async () => {
      await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(mockCompetitionRepository.save).toHaveBeenCalledWith(fakeComp);
    });

    it('should return the competition plain object', async () => {
      const result = await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(result).toBe(fakeComp);
    });
  });

  // ─── File linking ─────────────────────────────────────────────────────────

  describe('file linking', () => {
    it('should skip linking when url is not provided for a slot', async () => {
      await command.execute({
        user: fakeUser,
        competition: {
          ...baseCompetitionInput,
          avatar: 'https://cdn.example.com/avatar',
        },
      });

      expect(mockFileRepository.findByUrl).not.toHaveBeenCalledWith(null);
      expect(
        mockLinkerService.linkFileToCompetitionSlot,
      ).not.toHaveBeenCalled();
    });

    it('should skip linking when file is not found in repo', async () => {
      mockFileRepository.findByUrl.mockResolvedValue(null);

      await command.execute({
        user: fakeUser,
        competition: {
          ...baseCompetitionInput,
          avatar: 'https://cdn.example.com/avatar.png',
        },
      });

      expect(
        mockLinkerService.linkFileToCompetitionSlot,
      ).not.toHaveBeenCalled();
    });

    it('should link avatar when url and file exist', async () => {
      const file = fakeFile('https://cdn.example.com/avatar.png');
      mockFileRepository.findByUrl.mockResolvedValue(file);

      await command.execute({
        user: fakeUser,
        competition: { ...baseCompetitionInput, avatar: file.url },
      });

      expect(mockLinkerService.linkFileToCompetitionSlot).toHaveBeenCalledWith(
        file,
        fakeComp,
        'competition:avatar',
      );
    });

    it('should assign file url to comp.avatar after linking', async () => {
      const file = fakeFile('https://cdn.example.com/avatar.png');
      mockFileRepository.findByUrl.mockResolvedValue(file);

      await command.execute({
        user: fakeUser,
        competition: { ...baseCompetitionInput, avatar: file.url },
      });

      expect(fakeComp.avatar).toEqual({ url: file.url });
    });

    const slots = [
      { field: 'avatar', slot: 'competition:avatar' },
      { field: 'banner', slot: 'competition:banner' },
      { field: 'socialMedia', slot: 'competition:socialMedia' },
      { field: 'ultraWideBanner', slot: 'competition:ultraWideBanner' },
    ] as const;

    slots.forEach(({ field, slot }) => {
      it(`should link ${field} slot when url and file exist`, async () => {
        const file = fakeFile(`https://cdn.example.com/${field}.png`);
        mockFileRepository.findByUrl.mockResolvedValue(file);

        await command.execute({
          user: fakeUser,
          competition: { ...baseCompetitionInput, [field]: file.url },
        });

        expect(
          mockLinkerService.linkFileToCompetitionSlot,
        ).toHaveBeenCalledWith(file, fakeComp, slot);
        expect(fakeComp[field]).toEqual({ url: file.url });
      });
    });

    it('should link all 4 slots when all urls and files are provided', async () => {
      mockFileRepository.findByUrl.mockImplementation(async (url: string) =>
        fakeFile(url),
      );

      const input = {
        avatar: 'https://cdn.example.com/avatar.png',
        banner: 'https://cdn.example.com/banner.png',
        socialMedia: 'https://cdn.example.com/social.png',
        ultraWideBanner: 'https://cdn.example.com/ultra.png',
        rules: [],
        title: 'Full Cup',
      };

      await command.execute({ user: fakeUser, competition: input });

      expect(mockLinkerService.linkFileToCompetitionSlot).toHaveBeenCalledTimes(
        4,
      );
    });
  });

  // ─── Rules ───────────────────────────────────────────────────────────────

  describe('rules', () => {
    it('should add no rules when rules array is empty', async () => {
      await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(fakeComp.addRule).not.toHaveBeenCalled();
    });

    it('should add each rule to the competition', async () => {
      const rules = [
        { name: 'No cheating', description: 'Seriously', icon: Icons.BOOK },
        { name: 'Be cool', description: 'Always', icon: Icons.STAR },
      ];

      await command.execute({
        user: fakeUser,
        competition: { ...baseCompetitionInput, rules },
      });

      expect(fakeComp.addRule).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Transaction behavior ────────────────────────────────────────────────

  describe('transactions', () => {
    it('should start and commit transaction on success', async () => {
      await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(mockDBContext.startTransaction).toHaveBeenCalled();
      expect(mockDBContext.commitTransaction).toHaveBeenCalled();
      expect(mockDBContext.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockEventDispatcher.dispatchEvents).toHaveBeenCalled();
    });

    it('should rollback transaction on failure', async () => {
      mockCompetitionRepository.save.mockRejectedValue(new Error('boom'));

      await expect(
        command.execute({
          user: fakeUser,
          competition: baseCompetitionInput,
        }),
      ).rejects.toThrow();

      expect(mockDBContext.rollbackTransaction).toHaveBeenCalled();
    });
  });

  // ─── Save order ──────────────────────────────────────────────────────────

  describe('save order', () => {
    it('should save exactly twice — before files and after rules', async () => {
      await command.execute({
        user: fakeUser,
        competition: baseCompetitionInput,
      });

      expect(mockCompetitionRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should link all 4 slots when all urls and files are provided', async () => {
      const input = {
        avatar: 'https://cdn.example.com/avatar.png',
        banner: 'https://cdn.example.com/banner.png',
        socialMedia: 'https://cdn.example.com/social.png',
        ultraWideBanner: 'https://cdn.example.com/ultra.png',
        rules: [],
        title: 'Full Cup',
      };

      mockFileRepository.findByUrl.mockImplementation(async (url: string) =>
        fakeFile(url),
      );

      await command.execute({ user: fakeUser, competition: input });

      const calls = mockLinkerService.linkFileToCompetitionSlot.mock.calls;

      expect(calls).toHaveLength(4);

      const expected = [
        ['competition:avatar', input.avatar],
        ['competition:banner', input.banner],
        ['competition:socialMedia', input.socialMedia],
        ['competition:ultraWideBanner', input.ultraWideBanner],
      ];

      expected.forEach(([slot, url]) => {
        expect(
          calls.some(
            ([file, comp, calledSlot]) =>
              file.url === url && comp === fakeComp && calledSlot === slot,
          ),
        ).toBe(true);
      });
    });
  });
});
