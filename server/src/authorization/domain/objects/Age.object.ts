import { DomainError, DomainErrors } from 'src/error/DomainError';

export class Age {
  private _value: number;

  constructor(value: number) {
    if (value < 14 || value > 120)
      throw new DomainError(
        DomainErrors.UNEXPECTED_VALUE,
        'User should be older than 14 and younger than 120',
      );

    this._value = value;
  }

  static fromDate(birthDate: Date) {
    birthDate = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return new Age(age);
  }

  get value() {
    return this._value;
  }
}
