import { Inject, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Readable } from 'stream';

export abstract class BaseLoadController {
  @Inject()
  protected readonly configService: ConfigService;

  async load(stream: Readable, mimeType: string) {
    let size = 0;
    stream.on('data', (chunk: { length: number }) => {
      size += chunk.length;

      if (size > this.configService.getOrThrow<number>('storage.limit'))
        stream.destroy(
          new PayloadTooLargeException(
            `File should be smaller than ${this.configService.getOrThrow<number>('storage.limit')} bytes`,
          ),
        );
    });

    const file = await this._load(stream, mimeType);

    file.size = size;

    return file;
  }
  protected abstract _load(
    stream: Readable,
    mimeType: string,
  ): Promise<FileEntity>;
  abstract delete(file: FileEntity): Promise<void> | void;
  abstract getLink(file: FileEntity): Promise<string> | string;
}
