import { HashValue } from "lib/src/Hash";

const plainText = process.argv[2];

const hashValue = HashValue.makeFromPlainText(plainText);
console.log(hashValue.serialize());
