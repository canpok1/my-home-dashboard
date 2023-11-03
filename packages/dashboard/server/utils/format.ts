import { extractDatetimeElementJst } from './date'

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
  const { year, month, day } = extractDatetimeElementJst(d)
  const monthStr = month.toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')

  switch (t) {
    case 'YYYY/MM/DD':
      return `${year}/${monthStr}/${dayStr}`
  }
}
