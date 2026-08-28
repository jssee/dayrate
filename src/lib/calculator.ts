import { Result, TaggedError, type Result as ResultType } from 'better-result'
import * as v from 'valibot'

const DAYS_PER_YEAR = 365
const WEEKEND_DAYS_PER_YEAR = 104
const WORKING_DAYS_PER_YEAR = DAYS_PER_YEAR - WEEKEND_DAYS_PER_YEAR
const HOURS_PER_DAY = 8
const QUOTING_INCREMENT = 5
const SUB_CENT_TOLERANCE = 0.005

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

export type CalculatorValues = v.InferOutput<typeof calculatorValuesObjectSchema>
export type CalculatorValueName = keyof CalculatorValues
export type CalculatorInput = Partial<CalculatorValues>
export type CalculatorErrors = Partial<Record<CalculatorValueName, string>>

export interface CalculatorBreakdown {
  annualCompensation: number
  billableDays: number
  rawDayRate: number
  dayRate: number
  hourlyRate: number
}

export type CalculatorOutcome =
  | { kind: 'calculated'; values: CalculatorValues; breakdown: CalculatorBreakdown }
  | { kind: 'invalid'; fields: CalculatorErrors }
  | { kind: 'out-of-range' }

export const CALCULATOR_VALUE_NAMES = [
  'salary',
  'bonus',
  'benefits',
  'holidays',
  'sickDays',
  'nonBillable',
] as const satisfies readonly CalculatorValueName[]

export const DEFAULT_CALCULATOR_VALUES = Object.freeze(DEFAULT_VALUES)

class InvalidCalculatorValues extends TaggedError('InvalidCalculatorValues')<{
  fields: CalculatorErrors
  message: string
}> {}

class CalculationOutOfRange extends TaggedError('CalculationOutOfRange')<{
  message: string
}> {}

type CalculateDayRateError = InvalidCalculatorValues | CalculationOutOfRange

type CalculatedDayRate = {
  values: CalculatorValues
  breakdown: CalculatorBreakdown
}

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

function validateCalculatorValues(
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

function calculateAnnualCompensation(
  salary: number,
  bonusRate: number,
  benefitsRate: number,
): number {
  return salary * (1 + bonusRate + benefitsRate)
}

function calculateBillableDays(
  holidays: number,
  sickDays: number,
  nonBillableRate: number,
): number {
  return (WORKING_DAYS_PER_YEAR - holidays - sickDays) * (1 - nonBillableRate)
}

function calculateRawDayRate(annualCompensation: number, billableDays: number): number {
  return annualCompensation / billableDays
}

function roundUpDayRate(dayRate: number, increment: number): number {
  const quotient = dayRate / increment
  const nearestInteger = Math.round(quotient)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 4
  const adjustedQuotient =
    Math.abs(quotient - nearestInteger) <= tolerance ? nearestInteger : quotient

  return increment * Math.ceil(adjustedQuotient)
}

function calculateHourlyRate(dayRate: number): number {
  return dayRate / HOURS_PER_DAY
}

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

function calculateResult(
  input: CalculatorInput,
): ResultType<CalculatedDayRate, CalculateDayRateError> {
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
      ? Result.ok({ values, breakdown })
      : Result.err(
          new CalculationOutOfRange({
            message: 'Calculator values are outside the reliable numeric range.',
          }),
        )
  })
}

export function calculateDayRate(input: CalculatorInput): CalculatorOutcome {
  return calculateResult(input).match({
    ok: ({ values, breakdown }): CalculatorOutcome => ({
      kind: 'calculated',
      values,
      breakdown,
    }),
    err: (error): CalculatorOutcome =>
      error.match({
        InvalidCalculatorValues: ({ fields }): CalculatorOutcome => ({
          kind: 'invalid',
          fields,
        }),
        CalculationOutOfRange: (): CalculatorOutcome => ({ kind: 'out-of-range' }),
      }),
  })
}
