import * as timezoneMock from 'timezone-mock'
import { formatDailyLabel, formatDateJst, formatMonthlyLabel } from './format'

describe('formatDailyLabel', () => {
  it.each`
    year    | month | date  | expected
    ${2023} | ${1}  | ${2}  | ${'2023/01/02'}
    ${2023} | ${12} | ${31} | ${'2023/12/31'}
  `(
    '$year年$month月$date日が$expectedと変換されること',
    ({ year, month, date, expected }) => {
      expect(formatDailyLabel(year, month, date)).toEqual(expected)
    }
  )
})

describe('formatMonthlyLabel', () => {
  it.each`
    year    | month | expected
    ${2023} | ${1}  | ${'2023/01'}
    ${2023} | ${12} | ${'2023/12'}
  `(
    '$year年$month月が$expectedと変換されること',
    ({ year, month, expected }) => {
      expect(formatMonthlyLabel(year, month)).toEqual(expected)
    }
  )
})

describe('formatDateJst', () => {
  it.each`
    timezone       | date                               | formatType      | expected
    ${'UTC'}       | ${'2023-01-02T14:59:59.999Z'}      | ${'YYYY/MM/DD'} | ${'2023/01/02'}
    ${'UTC'}       | ${'2023-01-02T15:00:00.000Z'}      | ${'YYYY/MM/DD'} | ${'2023/01/03'}
    ${'UTC'}       | ${'2023-01-02T14:59:59.999+09:00'} | ${'YYYY/MM/DD'} | ${'2023/01/02'}
    ${'UTC'}       | ${'2023-01-02T15:00:00.000+09:00'} | ${'YYYY/MM/DD'} | ${'2023/01/02'}
    ${'Etc/GMT-9'} | ${'2023-01-02T14:59:59.999Z'}      | ${'YYYY/MM/DD'} | ${'2023/01/02'}
    ${'Etc/GMT-9'} | ${'2023-01-02T15:00:00.000Z'}      | ${'YYYY/MM/DD'} | ${'2023/01/03'}
    ${'Etc/GMT-9'} | ${'2023-01-02T14:59:59.999+09:00'} | ${'YYYY/MM/DD'} | ${'2023/01/02'}
    ${'Etc/GMT-9'} | ${'2023-01-02T15:00:00.000+09:00'} | ${'YYYY/MM/DD'} | ${'2023/01/02'}
  `(
    '$timezoneにおいて$dateを$formatType形式で$expectedに変換できること',
    ({ timezone, date, formatType, expected }) => {
      timezoneMock.register(timezone)
      const d = new Date(date)
      expect(formatDateJst(d, formatType)).toEqual(expected)
    }
  )
})
