import { FileSchema } from 'src/schemas/File.schema';
import { BaseRepository } from './BaseRepository';
import { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { FileMapper } from 'src/files/application/mappers/FileMapper';
import { In, Not } from 'typeorm';

export class FileRepository
  extends BaseRepository<FileSchema>
  implements IFileRepository
{
  protected _entitySchema: new () => FileSchema = FileSchema;

  @Inject(MapperTokens.FileMapper)
  private readonly fileMapper: FileMapper;

  async save(file: FileEntity): Promise<void> {
    await this.repository.save(this.fileMapper.toSchema(file));
  }

  async findByUrl(url: string): Promise<FileEntity | null> {
    const result = await this.repository.findOne({ where: { url } });
    if (!result) return null;

    return this.fileMapper.toEntity(result);
  }

  async deleteAllNonActiveByUrl(activeURLs: string[]): Promise<void> {
    if (activeURLs.length > 0) {
      await this.repository.delete({
        url: Not(In(activeURLs)),
      });
    } else {
      await this.repository.delete({});
    }
  }
}
