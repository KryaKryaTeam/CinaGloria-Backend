import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Readable } from 'stream';
import { BaseLoadController } from './BaseLoadController';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { MimeType } from 'src/files/domain/objects/MimeType.object';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LoadController } from '../services/LoadFileService';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { FileTypeResult } from 'file-type';

@LoadController('s3')
export class S3LoadController extends BaseLoadController {
  private get S3Client() {
    return new S3Client({
      credentials: {
        accessKeyId: this.configService.getOrThrow('storage.s3.id'),
        secretAccessKey: this.configService.getOrThrow('storage.s3.accessKey'),
      },
      region: this.configService.getOrThrow('storage.s3.region'),
    });
  }
  async _load(
    stream: Readable,
    mimeType: Promise<FileTypeResult | undefined>,
  ): Promise<FileEntity> {
    const mm = await mimeType;
    const file = FileEntity.create(null, new MimeType(mm?.mime));

    const upload = new Upload({
      params: {
        Bucket: this.configService.getOrThrow('storage.s3.bucket'),
        Key: file.url,
        Body: stream,
        ContentType: mm!.mime,
      },
      client: this.S3Client,
      queueSize: 1,
      partSize: 5 * 1024 * 1024,
    });

    await upload.done();

    return file;
  }
  async delete(file: FileEntity): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.getOrThrow('storage.s3.bucket'),
      Key: file.url,
    });

    await this.S3Client.send(command);
  }
  async getLink(file: FileEntity | InternalFile): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow('storage.s3.bucket'),
      Key: file instanceof FileEntity ? file.url : file.value,
    });
    return await getSignedUrl(this.S3Client, command, { expiresIn: 3600 });
  }
}
