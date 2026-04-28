jest.mock(
  'file-type',
  () => ({
    fileTypeFromBuffer: jest
      .fn()
      .mockResolvedValue({ ext: 'png', mime: 'image/png' }),
    fileTypeFromFile: jest
      .fn()
      .mockResolvedValue({ ext: 'png', mime: 'image/png' }),
    fileTypeFromStream: jest
      .fn()
      .mockResolvedValue({ ext: 'png', mime: 'image/png' }),
  }),
  { virtual: true },
);
