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

jest.mock(
  'marked',
  () => ({
    marked: {
      parse: jest.fn(() => '<p>mocked markdown</p>'),
    },
  }),
  { virtual: true },
);
