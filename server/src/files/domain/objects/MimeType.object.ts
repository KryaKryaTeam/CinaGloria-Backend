import { ApiError, FileErrors } from 'src/error/ApiError';

export class MimeType {
  private readonly _value: string;

  constructor(value: string | undefined) {
    if (!value) ApiError.throw(FileErrors.MIME_TYPE_IS_UNDEFINED);
    this._value = value;
  }

  get value() {
    return this._value;
  }

  get fileFormat() {
    return this._value.split('/')[1];
  }
}
