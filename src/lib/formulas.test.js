import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateAnnualCompensation,
  calculateBillableDays,
  calculateHourlyRate,
  calculateRawDayRate,
  roundUpDayRate,
} from './formulas.js'

test('calculates the annual compensation target', () => {
  assert.equal(calculateAnnualCompensation(100_000, 0.01, 0.2), 121_000)
})

test('retains fractional billable days', () => {
  assert.equal(calculateBillableDays(9, 7, 0.15), 208.25)
})

test('calculates and rounds the day rate up to the quoting increment', () => {
  const compensation = calculateAnnualCompensation(100_000, 0.01, 0.2)
  const billableDays = calculateBillableDays(9, 7, 0.2)
  const rawDayRate = calculateRawDayRate(compensation, billableDays)

  assert.equal(rawDayRate, 121_000 / 196)
  assert.equal(roundUpDayRate(rawDayRate), 620)
  assert.equal(roundUpDayRate(620), 620)
  assert.equal(roundUpDayRate(620.01), 625)
})

test('does not round an exact pipeline boundary up by another increment', () => {
  const compensation = calculateAnnualCompensation(50_000, 0, 0.1)
  const billableDays = calculateBillableDays(5, 6, 0.2)
  const rawDayRate = calculateRawDayRate(compensation, billableDays)

  assert.equal(rawDayRate, 275.00000000000006)
  assert.equal(roundUpDayRate(rawDayRate), 275)
})

test('calculates the hourly equivalent from the quoted day rate', () => {
  assert.equal(calculateHourlyRate(620), 77.5)
})
