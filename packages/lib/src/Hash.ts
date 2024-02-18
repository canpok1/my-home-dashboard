import crypto, { randomBytes } from "crypto";

const ALGORITHM = "sha256";
const DELIMITER = "#";

export class HashValue {
  salt: string;
  hash: string;

  static makeFromPlainText(plainText: string): HashValue {
    const salt = randomBytes(16).toString("hex");
    const hash = createHash(plainText, salt);
    return new HashValue(salt, hash);
  }

  static makeFromSerializedText(serializedText: string): HashValue {
    const splited = serializedText.split(DELIMITER);
    return new HashValue(splited[0], splited[1]);
  }

  constructor(salt: string, hash: string) {
    this.salt = salt;
    this.hash = hash;
  }

  serialize(): string {
    return this.salt + DELIMITER + this.hash;
  }

  isMatch(plainText: string): boolean {
    const hash = createHash(plainText, this.salt);
    return this.hash === hash;
  }
}

function createHash(plainText: string, salt: string): string {
  const hash = crypto.createHash(ALGORITHM);
  hash.update(salt + plainText);
  return hash.digest("hex");
}
