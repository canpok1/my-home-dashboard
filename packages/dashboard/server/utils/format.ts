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
