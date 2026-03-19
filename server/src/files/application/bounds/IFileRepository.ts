import { FileEntity } from 'src/files/domain/entities/File.entity';

export interface IFileRepository {
  save(file: FileEntity): Promise<void>;
  deleteAllNonActiveByUrl(activeURLs: string[]): Promise<void>;
  findByUrl(url: string): Promise<FileEntity | null>;
}
