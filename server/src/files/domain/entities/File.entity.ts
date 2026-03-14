import { Entity } from 'src/common/domain/Entity';
import { MimeType } from '../objects/MimeType.object';
import { randomUUID } from 'crypto';
import { DomainError, DomainErrors } from 'src/error/DomainError';

export interface IFileEntity {
  url: string;
  size: number | null;
  mimeType: MimeType;
}

export class FileEntity extends Entity {
  public readonly url: string;
  private _size: number | null;
  private readonly _mimeType: MimeType;

  private constructor(partial: IFileEntity) {
    super();
    this.url = partial.url;
    this._mimeType = partial.mimeType;
    this._size = partial.size;
  }

  static create(size: number | null, mimeType: MimeType) {
    return new FileEntity({
      url: `${randomUUID()}.${mimeType.fileFormat}`,
      mimeType,
      size,
    });
  }
  static load(file: IFileEntity) {
    return new FileEntity(file);
  }

  get size() {
    return this._size || 0;
  }

  get mimeType() {
    return this._mimeType;
  }

  set size(value: number) {
    if (this._size) throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    this._size = value;
  }
}
