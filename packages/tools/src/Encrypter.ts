import { EncryptedValue, SecretString } from "lib";

const plainText = process.argv[2];
const password = new SecretString(process.env.ENCRYPTION_PASSWORD || "");

const encrypted = EncryptedValue.makeFromPlainText(plainText, password);
console.log(encrypted.serialize());
