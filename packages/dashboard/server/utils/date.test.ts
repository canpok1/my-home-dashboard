import { extractDatetimeElementJst } from './date'

describe('extractDatetimeElementJst()', () => {
  it.each`
    name         | date                               | year    | month | day  | hours | minutes | seconds
    ${'UTC時間'} | ${'2023-01-02T00:11:22.000Z'}      | ${2023} | ${1}  | ${2} | ${9}  | ${11}   | ${22}
    ${'JST時間'} | ${'2023-01-02T00:11:22.000+09:00'} | ${2023} | ${1}  | ${2} | ${0}  | ${11}   | ${22}
  `(
    '$name[$date]を$year年$month月$day日$hours時$minutes分$seconds秒と分解できること',
    ({ date, year, month, day, hours, minutes, seconds }) => {
      const d = new Date(date)
      const actual = extractDatetimeElementJst(d)
      expect(actual.year).toEqual(year)
      expect(actual.month).toEqual(month)
      expect(actual.day).toEqual(day)
      expect(actual.hours).toEqual(hours)
      expect(actual.minutes).toEqual(minutes)
      expect(actual.seconds).toEqual(seconds)
    }
  )
})
