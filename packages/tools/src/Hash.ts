import { HashValue } from "lib";

const plainText = process.argv[2];

const hashValue = HashValue.makeFromPlainText(plainText);
console.log(hashValue.serialize());
