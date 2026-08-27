import { Result, TaggedError, type Result as ResultType } from 'better-result'

import {
  InvalidCalculatorValues,
  validateCalculatorValues,
  type CalculatorInput,
} from './calculator-values.ts'
import {
  calculateAnnualCompensation,
  calculateBillableDays,
  calculateHourlyRate,
  calculateRawDayRate,
  roundUpDayRate,
} from './formulas.ts'

export interface CalculatorBreakdown {
  annualCompensation: number
  billableDays: number
  rawDayRate: number
  dayRate: number
  hourlyRate: number
}

export class CalculationOutOfRange extends TaggedError('CalculationOutOfRange')<{
  message: string
}> {}

export type CalculateDayRateError = InvalidCalculatorValues | CalculationOutOfRange

const QUOTING_INCREMENT = 5
const SUB_CENT_TOLERANCE = 0.005

function isReliableBreakdown(breakdown: CalculatorBreakdown): boolean {
  const monetaryValues = [
    breakdown.annualCompensation,
    breakdown.rawDayRate,
    breakdown.dayRate,
    breakdown.hourlyRate,
  ]
  const preservesPositiveRate =
    breakdown.annualCompensation === 0 ||
    (breakdown.rawDayRate > 0 && breakdown.dayRate > 0 && breakdown.hourlyRate > 0)
  const respectsRoundingContract =
    breakdown.dayRate + SUB_CENT_TOLERANCE >= breakdown.rawDayRate &&
    breakdown.dayRate - breakdown.rawDayRate < QUOTING_INCREMENT + SUB_CENT_TOLERANCE

  return (
    breakdown.billableDays > 0 &&
    Number.isFinite(breakdown.billableDays) &&
    monetaryValues.every(
      (value) =>
        value >= 0 && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER,
    ) &&
    preservesPositiveRate &&
    respectsRoundingContract
  )
}

export function calculateDayRate(
  input: CalculatorInput,
): ResultType<CalculatorBreakdown, CalculateDayRateError> {
  return validateCalculatorValues(input).andThen((values) => {
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
    const dayRate = roundUpDayRate(rawDayRate, QUOTING_INCREMENT)
    const breakdown = {
      annualCompensation,
      billableDays,
      rawDayRate,
      dayRate,
      hourlyRate: calculateHourlyRate(dayRate),
    }

    return isReliableBreakdown(breakdown)
      ? Result.ok(breakdown)
      : Result.err(
          new CalculationOutOfRange({
            message: 'These values are outside the range that can be calculated reliably.',
          }),
        )
  })
}
