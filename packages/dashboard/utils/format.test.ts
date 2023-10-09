import { formatNumber } from './format'

describe('formatNumber()', () => {
  it.each`
    num              | decimalPlaces | expected
    ${0}             | ${0}          | ${'0'}
    ${1234567890}    | ${0}          | ${'1,234,567,890'}
    ${1234567890.4}  | ${0}          | ${'1,234,567,890'}
    ${1234567890.5}  | ${0}          | ${'1,234,567,891'}
    ${0}             | ${1}          | ${'0.0'}
    ${1234567890}    | ${1}          | ${'1,234,567,890.0'}
    ${1234567890.44} | ${1}          | ${'1,234,567,890.4'}
    ${1234567890.45} | ${1}          | ${'1,234,567,890.5'}
  `('$numが$expectedに変換されること', ({ num, decimalPlaces, expected }) => {
    expect(formatNumber(num, decimalPlaces)).toEqual(expected)
  })
})
