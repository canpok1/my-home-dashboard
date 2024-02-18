import { HashValue } from "./Hash";

describe("HashValueクラス", () => {
  it("ハッシュが元の文字と異なること", () => {
    const plainText = "dummy text";
    const hashValue = HashValue.makeFromPlainText(plainText);

    expect(hashValue.hash).not.toEqual(plainText);
  });

  describe("isMatch()", () => {
    const orgText = "dummy text";
    const hashValue = HashValue.makeFromPlainText(orgText);

    it.each`
      name                      | plainText        | expected
      ${"元文字列と同じ文字"}   | ${orgText}       | ${true}
      ${"元文字列と異なる文字"} | ${orgText + "a"} | ${false}
    `("$nameは$expectedと判定されること", ({ plainText, expected }) => {
      expect(hashValue.isMatch(plainText)).toEqual(expected);
    });
  });

  it("serialize文字列から復元できること", () => {
    const plainText = "dummy text";
    const org = HashValue.makeFromPlainText(plainText);

    const copy = HashValue.makeFromSerializedText(org.serialize());

    expect(org).toEqual(copy);
  });
});
