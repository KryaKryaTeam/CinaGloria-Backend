import { Inject, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { PassThrough, Readable } from 'stream';
import { fileTypeFromStream, FileTypeResult } from 'file-type';

export abstract class BaseLoadController {
  @Inject()
  protected readonly configService: ConfigService;

  async load(stream: Readable) {
    let size = 0;
    const limit = 64 * 1024 * 1024;
    const pass = new PassThrough();
    const pass2 = new PassThrough();

    const validateSize = new Promise((resolve, reject) => {
      stream.on('data', (chunk: { length: number }) => {
        size += chunk.length;
        if (size > limit) {
          stream.destroy();
          reject(new PayloadTooLargeException('File too large'));
        }
      });
      stream.on('end', () => resolve(size));
      stream.on('error', (err) => reject(err));
    });

    stream.pipe(pass);
    stream.pipe(pass2);
    const pr = fileTypeFromStream(pass);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_1, _2, file_] = await Promise.all([
      pr,
      validateSize,
      this._load(pass2, pr),
    ]);

    file_.size = size;

    return file_;
  }
  protected abstract _load(
    stream: Readable,
    mimeType: Promise<FileTypeResult | undefined>,
  ): Promise<FileEntity>;
  abstract delete(file: FileEntity): Promise<void> | void;
  abstract getLink(file: FileEntity | InternalFile): Promise<string> | string;
}
