import { LinkerApplicationService } from 'src/files/application/services/Linker.appService';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { MimeType } from 'src/files/domain/objects/MimeType.object';

describe('LinkerApplicationService', () => {
  const repo = {
    deleteRelationByUserAndScope: jest.fn(),
    deleteRelationByCompetitionAndScope: jest.fn(),
    save: jest.fn(),
  };

  const service = new LinkerApplicationService();
  (service as any).relationRepository = repo;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'u1' } as any;
  const fileData = {
    mimeType: new MimeType('image/png'),
    size: 100,
    url: 'someUrl',
  };

  const competition = { id: 'c1' } as any;

  describe('linkAvatarToUser', () => {
    it('should unlink previous avatar and save new relation', async () => {
      const file = FileEntity.load({
        ...fileData,
        slot: RelationString.define('user:avatar'),
      });
      await service.linkAvatarToUser(file, user);

      expect(repo.deleteRelationByUserAndScope).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();

      const savedRelation = repo.save.mock.calls[0][0];

      expect(savedRelation.user).toBe(user);
      expect(savedRelation.file).toBe(file);
      expect(savedRelation.slot).toBeDefined();
    });
  });

  describe('linkFileToCompetitionSlot', () => {
    it('should unlink previous slot and save new relation', async () => {
      const slot = RelationString.define('competition:banner');
      const file = FileEntity.load({ ...fileData, slot });
      await service.linkFileToCompetitionSlot(file, competition, slot);

      expect(repo.deleteRelationByCompetitionAndScope).toHaveBeenCalledWith(
        competition,
        slot,
      );

      expect(repo.save).toHaveBeenCalled();

      const savedRelation = repo.save.mock.calls[0][0];

      expect(savedRelation.competition).toBe(competition);
      expect(savedRelation.file).toBe(file);
      expect(savedRelation.slot).toBe('competition:banner');
    });

    it('should throw if slot family is invalid', async () => {
      const badSlot = RelationString.define('user:avatar');
      const file = FileEntity.load({
        ...fileData,
        slot: RelationString.define('competition:avatar'),
      });

      await expect(
        service.linkFileToCompetitionSlot(file, competition, badSlot),
      ).rejects.toThrow();
    });
  });
});
