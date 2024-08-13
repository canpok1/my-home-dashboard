/**
 * パターンに一致したn番目の要素を抽出
 * @param text 抽出元の文字列
 * @param p 抽出パターン
 * @param n 抽出要素のインデックス
 * @returns 一致したn番目(0〜)の要素
 */
export function nthMatch(text: string, p: RegExp, n: number): string {
  const matched = text.match(p);
  if (matched == null) {
    throw new Error(`no match, text[${text}], pattern[${p}]`);
  }
  if (matched.length <= n) {
    throw new Error(
      `n[${n}] is out of bounds, text[${text}], pattern[${p}], matched[${matched}]`
    );
  }
  return matched[n] || "";
}
