import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_CALCULATOR_VALUES, validateCalculatorValues } from './calculator-values.js'

test('accepts nonnegative decimal calculator values', () => {
  assert.deepEqual(
    validateCalculatorValues({
      ...DEFAULT_CALCULATOR_VALUES,
      salary: 100_001.25,
      holidays: 0.5,
      nonBillable: 99.5,
    }),
    {},
  )
})

test('identifies missing, negative, and out-of-range fields', () => {
  assert.deepEqual(
    validateCalculatorValues({
      ...DEFAULT_CALCULATOR_VALUES,
      salary: undefined,
      bonus: -1,
      nonBillable: 100,
    }),
    {
      salary: 'Enter a number.',
      bonus: 'Enter 0 or greater.',
      nonBillable: 'Enter a percentage below 100.',
    },
  )
})

test('associates the combined day limit with both fields', () => {
  assert.deepEqual(
    validateCalculatorValues({
      ...DEFAULT_CALCULATOR_VALUES,
      holidays: 254,
      sickDays: 7,
    }),
    {
      holidays: 'Holidays and sick days must total fewer than 261 days.',
      sickDays: 'Holidays and sick days must total fewer than 261 days.',
    },
  )
})
