import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Readable } from 'stream';

export interface ILoadFileService {
  loadFile(file: Readable, mimeType: string): Promise<FileEntity>;
  deleteFile(file: FileEntity): Promise<void>;
  getLink(file: FileEntity): Promise<string> | string;
}
