export function formatDailyLabel(
  year: number,
  month: number,
  date: number
): string {
  const yyyy = String(year).padStart(4, '0')
  const mm = String(month).padStart(2, '0')
  const dd = String(date).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

export function formatMonthlyLabel(year: number, month: number): string {
  const yyyy = String(year).padStart(4, '0')
  const mm = String(month).padStart(2, '0')
  return `${yyyy}/${mm}`
}

export type FormatType = 'YYYY/MM/DD'
export function formatDateJst(d: Date, t: FormatType): string {
  // 日本時間に補正
  const offsetted = new Date(
    d.getTime() + (d.getTimezoneOffset() + 9 * 60) * 60 * 1000
  )

  const year = offsetted.getFullYear()
  const month = (offsetted.getMonth() + 1).toString().padStart(2, '0')
  const day = offsetted.getDate().toString().padStart(2, '0')

  switch (t) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`
  }
}
