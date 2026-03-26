import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AppSlotCode } from 'src/types/RelationSlots';
import { FileEntity } from '../entities/File.entity';

export class InternalFile<S extends AppSlotCode = AppSlotCode> {
  private readonly _value: string;
  private readonly _slot: S;

  private constructor(value: string) {
    if (!value.startsWith('internal_file:'))
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    this._value = value;
  }

  static define<T extends AppSlotCode = AppSlotCode>(
    value: string,
    slot: AppSlotCode,
    expected: T,
  ) {
    if (slot !== expected) throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return new InternalFile<T>(
      value.startsWith('internal_file:') ? value : `internal_file:${value}`,
    );
  }

  static fromFileEntity<T extends AppSlotCode = AppSlotCode>(
    file: FileEntity,
    expected: T,
  ) {
    if (file.slot.value != expected)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return new InternalFile<T>(`internal_file:${file.url}`);
  }

  get value(): string {
    return this._value;
  }

  get url(): string {
    return this._value.replaceAll('internal_file:', '');
  }
}
