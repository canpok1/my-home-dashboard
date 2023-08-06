export class SecretString {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  value(): string {
    return this._value;
  }

  toString(): string {
    return this.mask();
  }

  toJSON(): string {
    return this.mask();
  }

  private mask(): string {
    let masked = this._value.length >= 3 ? this._value.substring(0, 3) : "";
    return masked + "**********";
  }
}
