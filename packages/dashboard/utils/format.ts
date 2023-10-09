export function formatNumber(n: number, decimalPlaces: number): string {
  const f = new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
  return f.format(n)
}
