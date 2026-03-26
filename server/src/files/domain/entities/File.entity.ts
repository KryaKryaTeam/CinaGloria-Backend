import { Entity } from 'src/common/domain/Entity';
import { MimeType } from '../objects/MimeType.object';
import { randomUUID } from 'crypto';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { RelationString } from '../objects/RelationSlots';

export interface IFileEntity {
  url: string;
  size: number | null;
  slot: RelationString | undefined;
  mimeType: MimeType;
}

export interface IFilePlain {
  url: string;
  size: number;
  slot: string;
  mimeType: string;
}

export class FileEntity extends Entity {
  public readonly url: string;
  private _size: number | null;
  private _slot: RelationString | undefined;
  private readonly _mimeType: MimeType;

  private constructor(partial: IFileEntity) {
    super();
    this.url = partial.url;
    this._mimeType = partial.mimeType;
    this._slot = partial.slot;
    this._size = partial.size;
  }

  static create(
    size: number | null,
    mimeType: MimeType,
    relationString?: RelationString,
  ) {
    return new FileEntity({
      url: `${randomUUID()}.${mimeType.fileFormat}`,
      slot: relationString,
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

  get slot(): RelationString {
    if (!this._slot) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    return this._slot;
  }

  get mimeType() {
    return this._mimeType;
  }

  set size(value: number) {
    if (this._size) throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    this._size = value;
  }

  set slot(value: RelationString) {
    if (this._slot) throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    this._slot = value;
  }

  get toJSON(): IFilePlain {
    return {
      url: this.url,
      mimeType: this._mimeType.value,
      size: this.size || 0,
      slot: this.slot.value,
    };
  }
}
