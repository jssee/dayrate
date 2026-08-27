import { WORKING_DAYS_PER_YEAR } from './formulas.js'

/**
 * @typedef {object} CalculatorValues
 * @property {number} salary
 * @property {number} bonus
 * @property {number} benefits
 * @property {number} holidays
 * @property {number} sickDays
 * @property {number} nonBillable
 */

/** @type {Readonly<CalculatorValues>} */
export const DEFAULT_CALCULATOR_VALUES = Object.freeze({
  salary: 0,
  bonus: 1,
  benefits: 20,
  holidays: 9,
  sickDays: 7,
  nonBillable: 20,
})

export const CALCULATOR_VALUE_NAMES = /** @type {const} */ ([
  'salary',
  'bonus',
  'benefits',
  'holidays',
  'sickDays',
  'nonBillable',
])

/**
 * @typedef {typeof CALCULATOR_VALUE_NAMES[number]} CalculatorValueName
 * @typedef {Partial<Record<CalculatorValueName, string>>} CalculatorErrors
 */

/**
 * @param {CalculatorValueName} name
 * @param {number | undefined} value
 * @returns {string | undefined}
 */
function validateScalarValue(name, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Enter a number.'
  if (value < 0) return 'Enter 0 or greater.'
  if (name === 'nonBillable' && value >= 100) return 'Enter a percentage below 100.'

  return undefined
}

/**
 * Replace invalid scalar values first, then enforce invariants involving multiple fields.
 *
 * @param {CalculatorValues} values
 * @returns {CalculatorValues}
 */
export function normalizeCalculatorValues(values) {
  const normalized = { ...values }

  for (const name of CALCULATOR_VALUE_NAMES) {
    if (validateScalarValue(name, normalized[name])) {
      normalized[name] = DEFAULT_CALCULATOR_VALUES[name]
    }
  }

  if (normalized.holidays + normalized.sickDays >= WORKING_DAYS_PER_YEAR) {
    normalized.holidays = DEFAULT_CALCULATOR_VALUES.holidays
    normalized.sickDays = DEFAULT_CALCULATOR_VALUES.sickDays
  }

  return normalized
}

/**
 * @param {Partial<CalculatorValues>} values
 * @returns {CalculatorErrors}
 */
export function validateCalculatorValues(values) {
  /** @type {CalculatorErrors} */
  const errors = {}

  for (const name of CALCULATOR_VALUE_NAMES) {
    const error = validateScalarValue(name, values[name])
    if (error) errors[name] = error
  }

  if (
    !errors.holidays &&
    !errors.sickDays &&
    typeof values.holidays === 'number' &&
    typeof values.sickDays === 'number' &&
    values.holidays + values.sickDays >= WORKING_DAYS_PER_YEAR
  ) {
    const message = `Holidays and sick days must total fewer than ${WORKING_DAYS_PER_YEAR} days.`
    errors.holidays = message
    errors.sickDays = message
  }

  return errors
}
