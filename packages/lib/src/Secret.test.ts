import { SecretString } from "./Secret";

describe("SecretStringクラス", () => {
  describe("toString()", () => {
    it.each`
      org         | expected
      ${"x"}      | ${"**********"}
      ${"xx"}     | ${"**********"}
      ${"xxx"}    | ${"**********"}
      ${"xxxx"}   | ${"x**********"}
      ${"xxxxx"}  | ${"xx**********"}
      ${"xxxxxx"} | ${"xxx**********"}
    `("$orgが$expectedに変換されること", ({ org, expected }) => {
      const s = new SecretString(org);
      expect(s.toString()).toEqual(expected);
    });
  });

  describe("toJSON()", () => {
    it.each`
      org         | expected
      ${"x"}      | ${"**********"}
      ${"xx"}     | ${"**********"}
      ${"xxx"}    | ${"**********"}
      ${"xxxx"}   | ${"x**********"}
      ${"xxxxx"}  | ${"xx**********"}
      ${"xxxxxx"} | ${"xxx**********"}
    `("$orgが$expectedに変換されること", ({ org, expected }) => {
      const s = new SecretString(org);
      expect(s.toJSON()).toEqual(expected);
    });
  });

  it("文字列連結時にマスクされること", () => {
    const s = new SecretString("xxx");
    expect("aaa" + s + "bbb").toEqual("aaa**********bbb");
  });

  it("JSON.stringifyでマスクされること", () => {
    const json = {
      a: new SecretString("xxx"),
    };
    expect(JSON.stringify(json)).toEqual('{"a":"**********"}');
  });
});
