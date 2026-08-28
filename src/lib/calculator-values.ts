import { Result, TaggedError, type Result as ResultType } from 'better-result'

import { WORKING_DAYS_PER_YEAR } from './formulas.ts'

export interface CalculatorValues {
  salary: number
  bonus: number
  benefits: number
  holidays: number
  sickDays: number
  nonBillable: number
}

export interface CalculatorInput {
  salary?: number | undefined
  bonus?: number | undefined
  benefits?: number | undefined
  holidays?: number | undefined
  sickDays?: number | undefined
  nonBillable?: number | undefined
}

export interface CalculatorErrors {
  salary?: string
  bonus?: string
  benefits?: string
  holidays?: string
  sickDays?: string
  nonBillable?: string
}

export type CalculatorValueName = keyof CalculatorValues

export const CALCULATOR_VALUE_NAMES = [
  'salary',
  'bonus',
  'benefits',
  'holidays',
  'sickDays',
  'nonBillable',
] as const satisfies readonly CalculatorValueName[]

export const DEFAULT_CALCULATOR_VALUES = Object.freeze({
  salary: 0,
  bonus: 1,
  benefits: 20,
  holidays: 9,
  sickDays: 7,
  nonBillable: 20,
} satisfies CalculatorValues)

export class InvalidCalculatorValues extends TaggedError('InvalidCalculatorValues')<{
  fields: CalculatorErrors
  message: string
}> {}

type ScalarValidation =
  | { status: 'valid'; value: number }
  | { status: 'invalid'; message: string }

function validateScalarValue(
  name: CalculatorValueName,
  value: number | undefined,
): ScalarValidation {
  if (value === undefined || !Number.isFinite(value)) {
    return { status: 'invalid', message: 'Enter a number.' }
  }
  if (value < 0) return { status: 'invalid', message: 'Enter 0 or greater.' }
  if (name === 'nonBillable' && value >= 100) {
    return { status: 'invalid', message: 'Enter a percentage below 100.' }
  }

  return { status: 'valid', value }
}

/**
 * Replace invalid scalar values first, then enforce invariants involving multiple fields.
 */
export function normalizeCalculatorValues(values: CalculatorInput): CalculatorValues {
  const normalized = { ...DEFAULT_CALCULATOR_VALUES } satisfies CalculatorValues

  for (const name of CALCULATOR_VALUE_NAMES) {
    const scalar = validateScalarValue(name, values[name])
    if (scalar.status === 'valid') normalized[name] = scalar.value
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
  const validated = { ...DEFAULT_CALCULATOR_VALUES } satisfies CalculatorValues

  for (const name of CALCULATOR_VALUE_NAMES) {
    const scalar = validateScalarValue(name, values[name])

    if (scalar.status === 'invalid') {
      fields[name] = scalar.message
    } else {
      validated[name] = scalar.value
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
