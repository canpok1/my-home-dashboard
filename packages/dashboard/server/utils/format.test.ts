import { formatDailyLabel, formatMonthlyLabel } from './format'

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
