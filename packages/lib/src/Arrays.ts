/**
 * 配列内からキーに対応する値を文字列として取得します
 *
 * 例) ["aaa", "bbb=ccc"]のとき
 *    ・キーが "bbb" だと 値は "ccc"
 *    ・キーが "aaa" だと 値は null
 * @param array 配列
 * @param key キー
 */
export function findValueString(array: string[], key: string): string | null {
  if (!array) {
    return null;
  }
  for (const value of array) {
    const k = key + "=";
    if (value.startsWith(k)) {
      return value.substring(k.length);
    }
  }
  return null;
}

/**
 * 配列内からキーに対応する値を文字列配列として取得します
 *
 * 例) ["aaa", "bbb=ccc,ddd"]のとき
 *    ・キーが "bbb" だと 値は ["ccc", "ddd"]
 *    ・キーが "aaa" だと 値は []
 * @param array 配列
 * @param key キー
 */
export function findValueStrings(array: string[], key: string): string[] {
  const value = findValueString(array, key);
  if (value) {
    return value.split(",");
  } else {
    return [];
  }
}
