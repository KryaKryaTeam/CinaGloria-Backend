import { BadRequestException } from '@nestjs/common';

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
      throw new BadRequestException(
        'Username should be longer than 8 and shorter than 50 symbols',
      );

    if (value.startsWith('_'))
      throw new BadRequestException('Username shouldn`t start with _');

    return new Username(value);
  }

  get value(): string {
    return this._value;
  }
}
