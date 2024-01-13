import { findValueString, findValueStrings } from "./Arrays";

it.each`
  array                  | key    | expected
  ${undefined}           | ${"a"} | ${null}
  ${null}                | ${"a"} | ${null}
  ${[]}                  | ${"a"} | ${null}
  ${["a", "b=c"]}        | ${"a"} | ${null}
  ${["a", "b=c", "b=d"]} | ${"b"} | ${"c"}
`("findValueString($array, $key) -> $expected", ({ array, key, expected }) => {
  expect(findValueString(array, key)).toEqual(expected);
});

it.each`
  array                      | key    | expected
  ${undefined}               | ${"a"} | ${[]}
  ${null}                    | ${"a"} | ${[]}
  ${[]}                      | ${"a"} | ${[]}
  ${["a", "b=c"]}            | ${"a"} | ${[]}
  ${["a", "b=c,d", "b=e,f"]} | ${"b"} | ${["c", "d"]}
`("findValueStrings($array, $key) -> $expected", ({ array, key, expected }) => {
  expect(findValueStrings(array, key)).toEqual(expected);
});
