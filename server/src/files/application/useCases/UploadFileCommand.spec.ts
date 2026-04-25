import { UploadFileCommand } from 'src/files/application/useCases/UploadFileCommand';

describe('UploadFileCommand', () => {
  const loadFileService = {
    loadFile: jest.fn(),
  };

  const fileRepository = {
    save: jest.fn(),
  };

  const command = new UploadFileCommand();
  (command as any).loadFileService = loadFileService;
  (command as any).fileRepository = fileRepository;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load file and persist it', async () => {
    const file = { id: 'f1', url: 'file.png' } as any;

    loadFileService.loadFile.mockResolvedValue(file);
    fileRepository.save.mockResolvedValue(undefined);

    const stream = {} as any;
    const relationString = { value: 'file:avatar' } as any;

    const result = await command.execute({
      stream,
      relationString,
    });

    expect(loadFileService.loadFile).toHaveBeenCalledWith(
      stream,
      relationString,
    );

    expect(fileRepository.save).toHaveBeenCalledWith(file);

    expect(result).toEqual({ file });
  });
});
