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

  @Column()
  slot: string;

  @OneToMany(() => FileRelation, (rel) => rel.file)
  relations: FileRelation[];
}
