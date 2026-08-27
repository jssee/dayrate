import { validateCalculatorValues } from './calculator-values.js'
import {
  calculateAnnualCompensation,
  calculateBillableDays,
  calculateHourlyRate,
  calculateRawDayRate,
  roundUpDayRate,
} from './formulas.js'

/**
 * @typedef {import('./calculator-values.js').CalculatorValues} CalculatorValues
 * @typedef {object} CalculatorBreakdown
 * @property {number} annualCompensation
 * @property {number} billableDays
 * @property {number} rawDayRate
 * @property {number} dayRate
 * @property {number} hourlyRate
 */

/**
 * Calculate the complete rate breakdown from user-facing calculator values.
 *
 * @param {CalculatorValues} values
 * @returns {CalculatorBreakdown | null}
 */
export function calculateDayRate(values) {
  if (Object.keys(validateCalculatorValues(values)).length > 0) return null

  const annualCompensation = calculateAnnualCompensation(
    values.salary,
    values.bonus / 100,
    values.benefits / 100,
  )
  const billableDays = calculateBillableDays(
    values.holidays,
    values.sickDays,
    values.nonBillable / 100,
  )
  const rawDayRate = calculateRawDayRate(annualCompensation, billableDays)
  const dayRate = roundUpDayRate(rawDayRate)

  return {
    annualCompensation,
    billableDays,
    rawDayRate,
    dayRate,
    hourlyRate: calculateHourlyRate(dayRate),
  }
}
