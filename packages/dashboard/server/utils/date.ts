export interface DatetimeElement {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds: number
}

export function extractDatetimeElementJst(d: Date): DatetimeElement {
  // 日本時間に補正
  const offsetted = new Date(
    d.getTime() + (d.getTimezoneOffset() + 9 * 60) * 60 * 1000
  )

  return {
    year: offsetted.getFullYear(),
    month: offsetted.getMonth() + 1,
    day: offsetted.getDate(),
    hours: offsetted.getHours(),
    minutes: offsetted.getMinutes(),
    seconds: offsetted.getSeconds(),
  }
}
