import { Entity } from 'src/common/domain/Entity';
import { FileEntity } from './File.entity';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import { randomUUID } from 'crypto';
import { ApiError, FileErrors } from 'src/error/ApiError';
import { RelationString } from '../objects/RelationSlots';
import { CompetitionEntity } from 'src/competitions/domain/entities/Competition.entity';

interface IFileRelationEntity {
  id: string;
  file: FileEntity;
  slot?: RelationString;
  user?: UserEntity;
  competition?: CompetitionEntity;
}

export class FileRelationEntity extends Entity {
  public readonly id: string;
  private _file: FileEntity;
  private _slot?: RelationString;
  private _user?: UserEntity;
  private _competition?: CompetitionEntity;

  private constructor(partial: IFileRelationEntity) {
    super();
    this.id = partial.id;
    this._slot = partial.slot;
    this._file = partial.file;
    this._user = partial.user;
    this._competition = partial.competition;
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

    if (slot.value != this.file.slot.value)
      ApiError.throw(FileErrors.SLOT_MISMATCH);

    if (this._user && slot.family !== 'user')
      ApiError.throw(FileErrors.ENTITY_MISMATCH);

    if (this._competition && slot.family !== 'competition')
      ApiError.throw(FileErrors.ENTITY_MISMATCH);

    this._slot = slot;
  }

  public set user(value: UserEntity) {
    if (this.relatedToEntity) ApiError.throw(FileErrors.RELATION_IMMUTABLE);

    this._user = value;
  }

  public set competition(value: CompetitionEntity) {
    if (this.relatedToEntity) ApiError.throw(FileErrors.RELATION_IMMUTABLE);

    this._competition = value;
  }

  private get relatedToEntity() {
    if (typeof this._user !== 'undefined') return true;
    if (typeof this._competition !== 'undefined') return true;
    return false;
  }

  public get user(): UserEntity | undefined {
    return this._user;
  }

  public get competition(): CompetitionEntity | undefined {
    return this._competition;
  }

  public get file() {
    return this._file;
  }

  public get filed() {
    return this._slot && this.relatedToEntity;
  }

  public get slot(): string {
    if (!this._slot)
      ApiError.throw(FileErrors.INCOMPLETE_RELATION, 'Slot is not defined');
    return this._slot.value;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      file: this.file,
      slot: this.slot,
      user: this.user?.id,
      competition: this.competition?.id,
    };
  }
}
