import assert from 'node:assert/strict'
import test from 'node:test'

import { CalculationOutOfRange, calculateDayRate } from './calculator.ts'
import { DEFAULT_CALCULATOR_VALUES, InvalidCalculatorValues } from './calculator-values.ts'

test('calculates the complete day-rate breakdown from calculator values', () => {
  const result = calculateDayRate({ ...DEFAULT_CALCULATOR_VALUES, salary: 100_000 })

  assert.equal(result.status, 'ok')
  if (result.status === 'ok') {
    assert.deepEqual(result.value, {
      annualCompensation: 121_000,
      billableDays: 196,
      rawDayRate: 121_000 / 196,
      dayRate: 620,
      hourlyRate: 77.5,
    })
  }
})

test('returns field errors for invalid calculator values', () => {
  const result = calculateDayRate({ ...DEFAULT_CALCULATOR_VALUES, nonBillable: 100 })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.equal(InvalidCalculatorValues.is(result.error), true)
    if (InvalidCalculatorValues.is(result.error)) {
      assert.deepEqual(result.error.fields, {
        nonBillable: 'Enter a percentage below 100.',
      })
    }
  }
})

test('rejects results outside JavaScript reliable numeric range', () => {
  const result = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: Number.MAX_SAFE_INTEGER,
  })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.equal(CalculationOutOfRange.is(result.error), true)
    assert.equal(
      result.error.message,
      'These values are outside the range that can be calculated reliably.',
    )
  }
})


test('rejects magnitudes that can violate the round-up contract', () => {
  const result = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 1_652_892_561_983_472,
    holidays: 254,
    sickDays: 6,
    nonBillable: 0,
  })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.equal(CalculationOutOfRange.is(result.error), true)
  }
})

test('rejects positive compensation that underflows to a zero rate', () => {
  const result = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: Number.MIN_VALUE,
  })

  assert.equal(result.status, 'error')
  if (result.status === 'error') {
    assert.equal(CalculationOutOfRange.is(result.error), true)
    assert.equal(
      result.error.message,
      'These values are outside the range that can be calculated reliably.',
    )
  }
})
