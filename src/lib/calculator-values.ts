import { Result, TaggedError, type Result as ResultType } from 'better-result'

import { WORKING_DAYS_PER_YEAR } from './formulas.ts'

export const CALCULATOR_VALUE_NAMES = [
  'salary',
  'bonus',
  'benefits',
  'holidays',
  'sickDays',
  'nonBillable',
] as const

export type CalculatorValueName = (typeof CALCULATOR_VALUE_NAMES)[number]
export type CalculatorValues = Record<CalculatorValueName, number>
export type CalculatorInput = Partial<Record<CalculatorValueName, number | undefined>>
export type CalculatorErrors = Partial<Record<CalculatorValueName, string>>

export const DEFAULT_CALCULATOR_VALUES: Readonly<CalculatorValues> = Object.freeze({
  salary: 0,
  bonus: 1,
  benefits: 20,
  holidays: 9,
  sickDays: 7,
  nonBillable: 20,
})

export class InvalidCalculatorValues extends TaggedError('InvalidCalculatorValues')<{
  fields: CalculatorErrors
  message: string
}> {}

function validateScalarValue(
  name: CalculatorValueName,
  value: number | undefined,
): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Enter a number.'
  if (value < 0) return 'Enter 0 or greater.'
  if (name === 'nonBillable' && value >= 100) return 'Enter a percentage below 100.'

  return undefined
}

/**
 * Replace invalid scalar values first, then enforce invariants involving multiple fields.
 */
export function normalizeCalculatorValues(values: CalculatorInput): CalculatorValues {
  const normalized: CalculatorValues = { ...DEFAULT_CALCULATOR_VALUES }

  for (const name of CALCULATOR_VALUE_NAMES) {
    const value = values[name]
    if (!validateScalarValue(name, value) && typeof value === 'number') normalized[name] = value
  }

  if (normalized.holidays + normalized.sickDays >= WORKING_DAYS_PER_YEAR) {
    normalized.holidays = DEFAULT_CALCULATOR_VALUES.holidays
    normalized.sickDays = DEFAULT_CALCULATOR_VALUES.sickDays
  }

  return normalized
}

export function validateCalculatorValues(
  values: CalculatorInput,
): ResultType<CalculatorValues, InvalidCalculatorValues> {
  const fields: CalculatorErrors = {}
  const validated: CalculatorValues = { ...DEFAULT_CALCULATOR_VALUES }

  for (const name of CALCULATOR_VALUE_NAMES) {
    const value = values[name]
    const error = validateScalarValue(name, value)

    if (error) {
      fields[name] = error
    } else if (typeof value === 'number') {
      validated[name] = value
    }
  }

  if (
    !fields.holidays &&
    !fields.sickDays &&
    validated.holidays + validated.sickDays >= WORKING_DAYS_PER_YEAR
  ) {
    const message = `Holidays and sick days must total fewer than ${WORKING_DAYS_PER_YEAR} days.`
    fields.holidays = message
    fields.sickDays = message
  }

  if (Object.keys(fields).length > 0) {
    return Result.err(
      new InvalidCalculatorValues({ fields, message: 'Some calculator values are invalid.' }),
    )
  }

  return Result.ok(validated)
}
