import { FileSchema } from 'src/schemas/File.schema';
import { BaseRepository } from './BaseRepository';
import { IFileRepository } from 'src/files/application/bounds/IFileRepository';
import { FileEntity } from 'src/files/domain/entities/File.entity';
import { Inject } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { FileMapper } from 'src/files/application/mappers/FileMapper';
import { In } from 'typeorm';
import { FileRelation } from 'src/schemas/FileRelation.schema';

export class FileRepository
  extends BaseRepository<FileSchema>
  implements IFileRepository
{
  @Inject(MapperTokens.FileMapper)
  private readonly fileMapper: FileMapper;

  constructor() {
    super(FileSchema);
  }

  async save(file: FileEntity): Promise<void> {
    await this.repository.save(this.fileMapper.toSchema(file));
  }

  async findByUrl(url: string): Promise<FileEntity | null> {
    const result = await this.repository.findOne({ where: { url } });
    if (!result) return null;

    return this.fileMapper.toEntity(result);
  }

  async deleteFilesWithNoRelation(): Promise<FileEntity[]> {
    const orphans = await this.repository
      .createQueryBuilder('file')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('rel.file_url')
          .from(FileRelation, 'rel')
          .getQuery();
        return 'file.url NOT IN ' + subQuery;
      })
      .getMany();

    if (orphans.length == 0) return [];

    const urls = orphans.map((el) => this.fileMapper.toEntity(el));

    await this.repository.delete({ url: In(urls.map((el) => el.url)) });
    return urls;
  }
}
