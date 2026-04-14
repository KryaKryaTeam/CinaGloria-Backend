import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { PassThrough, Readable } from 'stream';
import { fileTypeFromStream, FileTypeResult } from 'file-type';
import { RelationString } from 'src/files/domain/objects/RelationSlots';
import sharp from 'sharp';
import { ApiError, FileErrors } from 'src/error/ApiError';

export abstract class BaseLoadController {
  @Inject()
  protected readonly configService: ConfigService;

  protected readonly logger = new Logger('BaseLoadController');

  async load(stream: Readable, relationString: RelationString) {
    const config = relationString.config;

    this.logger.debug(
      `[LOAD] Applying config for ${relationString.value}. Processing: ${relationString.config.shouldBeProcessed}`,
    );

    let size = 0;

    sharp.concurrency(this.configService.getOrThrow('storage.concurrency'));
    sharp.cache(this.configService.getOrThrow('storage.cache'));

    const source = config.shouldBeProcessed
      ? stream.pipe(
          sharp()
            .toFormat('webp')
            .webp({ quality: 80 })
            .resize(config.dimensions[0], config.dimensions[1], {
              fit: 'contain',
              withoutEnlargement: true,
              background: { r: 32, g: 32, b: 32, alpha: 1 },
            }),
        )
      : stream;

    const pass = new PassThrough();
    const pass2 = new PassThrough();

    let chunkCount = 0;

    const validateSize = new Promise((resolve, reject) => {
      source.on('data', (chunk: { length: number }) => {
        chunkCount++;
        size += chunk.length;
        if (size > config.maxSize) {
          stream.destroy();
          reject(ApiError.returnNew(FileErrors.FILE_TOO_LARGE));
        }
        if (chunkCount % 10 == 0) {
          this.logger.log(
            `[LOAD] Chunks loaded: ${chunkCount}, on total size: ${size}/${config.maxSize}`,
          );
        }
      });
      source.on('end', () => resolve(size));
      source.on('error', (err) => {
        this.logger.error(`[STREAM ERROR] ${err.message}`);
        reject(err);
      });
    });

    source.pipe(pass);
    source.pipe(pass2);

    const validateMimeType = fileTypeFromStream(pass).then((val) => {
      this.logger.log(`[LOAD] Mime type detected: ${val?.mime}`);
      if (
        !config.shouldBeProcessed &&
        (!val ||
          !config.allowedMimeTypes.includes(val.mime as `${string}/${string}`))
      ) {
        ApiError.throw(FileErrors.MIME_TYPE_IS_UNDEFINED);
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
