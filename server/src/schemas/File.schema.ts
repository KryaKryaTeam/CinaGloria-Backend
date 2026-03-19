import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { FileRelation } from './FileRelation.schema';

@Entity({ name: 'file' })
export class FileSchema {
  @PrimaryColumn()
  url: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @OneToMany(() => FileRelation, (rel) => rel.file)
  relations: FileRelation[];
}
