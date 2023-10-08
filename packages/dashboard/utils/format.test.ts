import { formatNumber } from './format'

describe('formatNumber()', () => {
  it.each`
    num           | expected
    ${0}          | ${'0'}
    ${1234567890} | ${'1,234,567,890'}
  `('$numが$expectedに変換されること', ({ num, expected }) => {
    expect(formatNumber(num)).toEqual(expected)
  })
})
