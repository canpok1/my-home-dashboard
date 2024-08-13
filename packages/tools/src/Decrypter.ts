import { EncryptedValue, SecretString } from "lib";

const serializedText = process.argv[2];
const password = new SecretString(process.env.ENCRYPTION_PASSWORD || "");

const encrypted = EncryptedValue.makeFromSerializedText(serializedText);
console.log(encrypted.decrypt(password).value());
