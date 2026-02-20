import { DomainError, DomainErrors } from 'src/error/DomainError';

export class AvatarURL {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static generate(listOfAvalible: string[]) {
    return new AvatarURL(
      listOfAvalible[Math.floor(Math.random() * listOfAvalible.length)],
    );
  }
  static create(value: string) {
    if (!value.includes('http://') || !value.includes('https://'))
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    return new AvatarURL(value);
  }

  get value() {
    return this._value;
  }
}
