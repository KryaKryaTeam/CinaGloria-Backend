import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Readable } from 'stream';
import { BaseLoadController } from './BaseLoadController';
import { MimeType } from 'src/files/domain/objects/MimeType.object';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { LoadController } from '../services/LoadFileService';

@LoadController('local')
export class LocalLoadController extends BaseLoadController {
  async _load(stream: Readable, mimeType: string): Promise<FileEntity> {
    const file = FileEntity.create(null, new MimeType(mimeType));

    const filePath = path.join(
      this.configService.getOrThrow('storage.ls.basePath'),
      file.url,
    );

    const promise = new Promise((res, rej) => {
      const ws = fs.createWriteStream(filePath, { flags: 'wx' });
      stream.pipe(ws);

      ws.on('error', () => {
        if (fs.existsSync(filePath))
          fsPromises.unlink(filePath).catch(() => {});
        rej(new Error('LS load failed!'));
      });
      ws.on('finish', () => {
        res('meow!');
      });
    });

    await promise;

    return file;
  }
  async delete(file: FileEntity): Promise<void> {
    const filePath = path.join(
      this.configService.getOrThrow('storage.ls.basePath'),
      file.url,
    );

    await fsPromises.unlink(filePath).catch((err) => {
      if ((err as { code: string }).code !== 'ENOENT') throw err;
    });
  }
  getLink(file: FileEntity): string {
    const url =
      this.configService.getOrThrow('server.baseUrl') + '/static/' + file.url;

    return url;
  }
}
