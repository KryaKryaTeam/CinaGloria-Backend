import { DomainError, DomainErrors } from 'src/error/DomainError';

export class Username {
  private readonly _value: string;
  private constructor(value: string) {
    this._value = value;
  }

  public static generate(adjectives: string[], animals: string[]): Username {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const suffix = Math.floor(Math.random() * 1000);

    return new Username(`${adj}-${animal}-${suffix}`);
  }

  public static create(value: string): Username {
    if (value.length < 8 || value.length > 50)
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (value.startsWith('_'))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    return new Username(value);
  }

  get value(): string {
    return this._value;
  }
}
