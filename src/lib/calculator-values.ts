import { Result, TaggedError, type Result as ResultType } from 'better-result'
import * as v from 'valibot'

import { WORKING_DAYS_PER_YEAR } from './formulas.ts'

const DEFAULT_VALUES = {
  salary: 0,
  bonus: 1,
  benefits: 20,
  holidays: 9,
  sickDays: 7,
  nonBillable: 20,
} as const

const NUMBER_MESSAGE = 'Enter a number.'
const NONNEGATIVE_MESSAGE = 'Enter 0 or greater.'
const NON_BILLABLE_MESSAGE = 'Enter a percentage below 100.'
const AVAILABLE_DAYS_MESSAGE = `Holidays and sick days must total fewer than ${WORKING_DAYS_PER_YEAR} days.`

const nonnegativeNumberSchema = v.pipe(
  v.number(NUMBER_MESSAGE),
  v.finite(NUMBER_MESSAGE),
  v.minValue(0, NONNEGATIVE_MESSAGE),
)
const nonBillableSchema = v.pipe(
  nonnegativeNumberSchema,
  v.check((value) => value < 100, NON_BILLABLE_MESSAGE),
)
const calculatorFields = {
  salary: nonnegativeNumberSchema,
  bonus: nonnegativeNumberSchema,
  benefits: nonnegativeNumberSchema,
  holidays: nonnegativeNumberSchema,
  sickDays: nonnegativeNumberSchema,
  nonBillable: nonBillableSchema,
}
const calculatorValuesObjectSchema = v.object(calculatorFields)

export type CalculatorValues = v.InferOutput<typeof calculatorValuesObjectSchema>

const calculatorValuesSchema = v.pipe(
  calculatorValuesObjectSchema,
  v.partialCheck(
    [['holidays'], ['sickDays']],
    (values) => values.holidays + values.sickDays < WORKING_DAYS_PER_YEAR,
    AVAILABLE_DAYS_MESSAGE,
  ),
)
const calculatorValuesWithDefaultsSchema = v.fallback(
  v.object({
    salary: v.fallback(calculatorFields.salary, DEFAULT_VALUES.salary),
    bonus: v.fallback(calculatorFields.bonus, DEFAULT_VALUES.bonus),
    benefits: v.fallback(calculatorFields.benefits, DEFAULT_VALUES.benefits),
    holidays: v.fallback(calculatorFields.holidays, DEFAULT_VALUES.holidays),
    sickDays: v.fallback(calculatorFields.sickDays, DEFAULT_VALUES.sickDays),
    nonBillable: v.fallback(calculatorFields.nonBillable, DEFAULT_VALUES.nonBillable),
  }),
  DEFAULT_VALUES,
)

export type CalculatorValueName = keyof CalculatorValues
export type CalculatorInput = Partial<CalculatorValues>
export type CalculatorErrors = Partial<Record<CalculatorValueName, string>>

export const CALCULATOR_VALUE_NAMES = [
  'salary',
  'bonus',
  'benefits',
  'holidays',
  'sickDays',
  'nonBillable',
] as const satisfies readonly CalculatorValueName[]

export const DEFAULT_CALCULATOR_VALUES = Object.freeze(DEFAULT_VALUES)

export class InvalidCalculatorValues extends TaggedError('InvalidCalculatorValues')<{
  fields: CalculatorErrors
  message: string
}> {}

/**
 * Default malformed values independently, then restore the paired day assumptions together.
 */
export function normalizeCalculatorValues(values: CalculatorInput): CalculatorValues {
  const normalized = { ...v.parse(calculatorValuesWithDefaultsSchema, values) }

  if (normalized.holidays + normalized.sickDays >= WORKING_DAYS_PER_YEAR) {
    normalized.holidays = DEFAULT_CALCULATOR_VALUES.holidays
    normalized.sickDays = DEFAULT_CALCULATOR_VALUES.sickDays
  }

  return normalized
}

export function validateCalculatorValues(
  values: CalculatorInput,
): ResultType<CalculatorValues, InvalidCalculatorValues> {
  const parsed = v.safeParse(calculatorValuesSchema, values)
  if (parsed.success) return Result.ok(parsed.output)

  const flattened = v.flatten(parsed.issues)
  const nested = flattened.nested
  const fields: CalculatorErrors = {}

  for (const name of CALCULATOR_VALUE_NAMES) {
    const message = nested?.[name]?.[0]
    if (message) fields[name] = message
  }

  const availableDaysMessage = flattened.root?.[0]
  if (availableDaysMessage) {
    fields.holidays = availableDaysMessage
    fields.sickDays = availableDaysMessage
  }

  return Result.err(
    new InvalidCalculatorValues({ fields, message: 'Some calculator values are invalid.' }),
  )
}
