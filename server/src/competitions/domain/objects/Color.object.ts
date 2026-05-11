export class Color {
  private constructor(private readonly _value: string) {}

  static define(value: string) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) throw new Error('Invalid color');
    return new Color(value);
  }

  get value() {
    return this._value;
  }

  get toJSON() {
    return this._value;
  }
}
