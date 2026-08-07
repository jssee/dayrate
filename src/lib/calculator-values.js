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
 * @typedef {typeof DEFAULT_CALCULATOR_VALUES} CalculatorValues
 * @typedef {typeof CALCULATOR_VALUE_NAMES[number]} CalculatorValueName
 * @typedef {Partial<Record<CalculatorValueName, string>>} CalculatorErrors
 */

/**
 * @param {Partial<CalculatorValues>} values
 * @returns {CalculatorErrors}
 */
export function validateCalculatorValues(values) {
  /** @type {CalculatorErrors} */
  const errors = {}

  for (const name of CALCULATOR_VALUE_NAMES) {
    const value = values[name]

    if (!Number.isFinite(value)) {
      errors[name] = 'Enter a number.'
    } else if (value < 0) {
      errors[name] = 'Enter 0 or greater.'
    }
  }

  if (!errors.nonBillable && values.nonBillable >= 100) {
    errors.nonBillable = 'Enter a percentage below 100.'
  }

  if (!errors.holidays && !errors.sickDays && values.holidays + values.sickDays >= 261) {
    const message = 'Holidays and sick days must total fewer than 261 days.'
    errors.holidays = message
    errors.sickDays = message
  }

  return errors
}
