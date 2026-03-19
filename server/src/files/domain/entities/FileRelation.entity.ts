import { Entity } from 'src/common/domain/Entity';
import { FileEntity } from './File.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { randomUUID } from 'crypto';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { RelationString } from '../objects/RelationSlots';

interface IFileRelationEntity {
  id: string;
  file: FileEntity;
  slot?: RelationString;
  user?: UserEntity;
}

export class FileRelationEntity extends Entity {
  public readonly id: string;
  private _file: FileEntity;
  private _slot?: RelationString;
  private _user?: UserEntity;

  private constructor(partial: IFileRelationEntity) {
    super();
    this.id = partial.id;
    this._slot = partial.slot;
    this._file = partial.file;
    this._user = partial.user;
  }

  static load(partial: IFileRelationEntity) {
    return new FileRelationEntity(partial);
  }

  static create(file: FileEntity) {
    return new FileRelationEntity({ id: randomUUID(), file });
  }

  public set slot(value: RelationString | string) {
    let slot = value;
    if (typeof slot == 'string') slot = RelationString.define(slot);

    if (this._user && slot.family !== 'user')
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    this._slot = slot;
  }

  public set user(value: UserEntity) {
    if (this.relatedToEntity)
      throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    this._user = value;
  }

  private get relatedToEntity() {
    if (typeof this._user !== 'undefined') return true;
    return false;
  }

  public get user(): UserEntity | undefined {
    return this._user;
  }

  public get file() {
    return this._file;
  }

  public get filed() {
    return this._slot && this.relatedToEntity;
  }

  public get slot(): string {
    if (!this._slot) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    return this._slot.value;
  }
}
