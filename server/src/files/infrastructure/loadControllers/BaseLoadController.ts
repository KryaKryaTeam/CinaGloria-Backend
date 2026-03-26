import {
  BadRequestException,
  Inject,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { PassThrough, Readable } from 'stream';
import { fileTypeFromStream, FileTypeResult } from 'file-type';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import sharp from 'sharp';

export abstract class BaseLoadController {
  @Inject()
  protected readonly configService: ConfigService;

  async load(stream: Readable, relationString: RelationString) {
    const config = relationString.config;

    let size = 0;

    const source = config.shouldBeProcessed
      ? stream.pipe(
          sharp()
            .toFormat('webp')
            .webp({ quality: 80 })
            .resize(config.dimensions[0], config.dimensions[1], {
              fit: 'cover',
            }),
        )
      : stream;

    const pass = new PassThrough();
    const pass2 = new PassThrough();

    const validateSize = new Promise((resolve, reject) => {
      source.on('data', (chunk: { length: number }) => {
        size += chunk.length;
        if (size > config.maxSize) {
          stream.destroy();
          reject(new PayloadTooLargeException('File too large'));
        }
      });
      source.on('end', () => resolve(size));
      source.on('error', (err) => reject(err));
    });

    source.pipe(pass);
    source.pipe(pass2);

    const validateMimeType = fileTypeFromStream(pass).then((val) => {
      if (
        !config.shouldBeProcessed &&
        (!val ||
          !config.allowedMimeTypes.includes(val.mime as `${string}/${string}`))
      ) {
        throw new BadRequestException('Mime type error!');
      }

      return config.shouldBeProcessed
        ? ({ mime: 'image/webp', ext: 'webp' } as FileTypeResult)
        : val;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_1, _2, file_] = await Promise.all([
      validateMimeType,
      validateSize,
      this._load(pass2, validateMimeType),
    ]);

    file_.size = size;
    file_.slot = relationString;

    return file_;
  }
  protected abstract _load(
    stream: Readable,
    mimeType: Promise<FileTypeResult | undefined>,
  ): Promise<FileEntity>;
  abstract delete(file: FileEntity): Promise<void> | void;
  abstract getLink(file: FileEntity | InternalFile): Promise<string> | string;
}
