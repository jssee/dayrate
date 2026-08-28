import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_CALCULATOR_VALUES, calculateDayRate } from './calculator.ts'

test('calculates the complete day-rate outcome from calculator input', () => {
  const outcome = calculateDayRate({ ...DEFAULT_CALCULATOR_VALUES, salary: 100_000 })

  assert.equal(outcome.kind, 'calculated')
  if (outcome.kind === 'calculated') {
    assert.deepEqual(outcome.values, { ...DEFAULT_CALCULATOR_VALUES, salary: 100_000 })
    assert.deepEqual(outcome.breakdown, {
      annualCompensation: 121_000,
      billableDays: 196,
      rawDayRate: 121_000 / 196,
      dayRate: 620,
      hourlyRate: 77.5,
    })
  }
})

test('accepts nonnegative decimal calculator values', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 100_001.25,
    holidays: 0.5,
    nonBillable: 99.5,
  })

  assert.equal(outcome.kind, 'calculated')
  if (outcome.kind === 'calculated') {
    assert.deepEqual(outcome.values, {
      ...DEFAULT_CALCULATOR_VALUES,
      salary: 100_001.25,
      holidays: 0.5,
      nonBillable: 99.5,
    })
  }
})

test('reports every missing, negative, and out-of-range field', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: undefined,
    bonus: -1,
    nonBillable: 100,
  })

  assert.equal(outcome.kind, 'invalid')
  if (outcome.kind === 'invalid') {
    assert.deepEqual(outcome.fields, {
      salary: 'Enter a number.',
      bonus: 'Enter 0 or greater.',
      nonBillable: 'Enter a percentage below 100.',
    })
  }
})

test('associates the combined day limit with both fields', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: undefined,
    holidays: 254,
    sickDays: 7,
  })

  assert.equal(outcome.kind, 'invalid')
  if (outcome.kind === 'invalid') {
    assert.deepEqual(outcome.fields, {
      salary: 'Enter a number.',
      holidays: 'Holidays and sick days must total fewer than 261 days.',
      sickDays: 'Holidays and sick days must total fewer than 261 days.',
    })
  }
})

test('rejects results outside JavaScript reliable numeric range', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: Number.MAX_SAFE_INTEGER,
  })

  assert.equal(outcome.kind, 'out-of-range')
})

test('rejects magnitudes that can violate the round-up contract', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 1_652_892_561_983_472,
    holidays: 254,
    sickDays: 6,
    nonBillable: 0,
  })

  assert.equal(outcome.kind, 'out-of-range')
})

test('rejects positive compensation that underflows to a zero rate', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: Number.MIN_VALUE,
  })

  assert.equal(outcome.kind, 'out-of-range')
})

test('does not round a floating-point pipeline boundary up again', () => {
  const outcome = calculateDayRate({
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 50_000,
    bonus: 0,
    benefits: 10,
    holidays: 5,
    sickDays: 6,
    nonBillable: 20,
  })

  assert.equal(outcome.kind, 'calculated')
  if (outcome.kind === 'calculated') {
    assert.equal(outcome.breakdown.rawDayRate, 275.00000000000006)
    assert.equal(outcome.breakdown.dayRate, 275)
  }
})
