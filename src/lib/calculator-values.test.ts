import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_CALCULATOR_VALUES,
  InvalidCalculatorValues,
  validateCalculatorValues,
} from './calculator-values.ts'

test('accepts nonnegative decimal calculator values', () => {
  const result = validateCalculatorValues({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 100_001.25,
    holidays: 0.5,
    nonBillable: 99.5,
  })

  assert.equal(result.status, 'ok')
  if (result.status === 'ok') {
    assert.deepEqual(result.value, {
      ...DEFAULT_CALCULATOR_VALUES,
      salary: 100_001.25,
      holidays: 0.5,
      nonBillable: 99.5,
    })
  }
})

test('reports every missing, negative, and out-of-range field', () => {
  const result = validateCalculatorValues({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: undefined,
    bonus: -1,
    nonBillable: 100,
  })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.equal(InvalidCalculatorValues.is(result.error), true)
    assert.deepEqual(result.error.fields, {
      salary: 'Enter a number.',
      bonus: 'Enter 0 or greater.',
      nonBillable: 'Enter a percentage below 100.',
    })
  }
})

test('associates the combined day limit with both fields', () => {
  const result = validateCalculatorValues({
    ...DEFAULT_CALCULATOR_VALUES,
    holidays: 254,
    sickDays: 7,
  })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.deepEqual(result.error.fields, {
      holidays: 'Holidays and sick days must total fewer than 261 days.',
      sickDays: 'Holidays and sick days must total fewer than 261 days.',
    })
  }
})
