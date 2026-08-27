import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateDayRate } from './calculator.js'
import { DEFAULT_CALCULATOR_VALUES } from './calculator-values.js'

test('calculates the complete day-rate breakdown from calculator values', () => {
  assert.deepEqual(
    calculateDayRate({ ...DEFAULT_CALCULATOR_VALUES, salary: 100_000 }),
    {
      annualCompensation: 121_000,
      billableDays: 196,
      rawDayRate: 121_000 / 196,
      dayRate: 620,
      hourlyRate: 77.5,
    },
  )
})

test('does not calculate a breakdown from invalid values', () => {
  assert.equal(
    calculateDayRate({ ...DEFAULT_CALCULATOR_VALUES, nonBillable: 100 }),
    null,
  )
})
