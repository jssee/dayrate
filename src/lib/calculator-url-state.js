import {
  CALCULATOR_VALUE_NAMES,
  DEFAULT_CALCULATOR_VALUES,
  validateCalculatorValues,
} from './calculator-values.js'

export { DEFAULT_CALCULATOR_VALUES } from './calculator-values.js'

/**
 * @typedef {typeof DEFAULT_CALCULATOR_VALUES} CalculatorValues
 */

/**
 * @param {typeof CALCULATOR_VALUE_NAMES[number]} name
 * @param {string | number | undefined} value
 * @returns {number}
 */
function parseValue(name, value) {
  if (typeof value === 'string' && value.trim() === '') return DEFAULT_CALCULATOR_VALUES[name]

  const number = Number(value)

  return Number.isFinite(number) ? number : DEFAULT_CALCULATOR_VALUES[name]
}

export class CalculatorUrlState {
  /**
   * @param {Window} [browser=window]
   */
  constructor(browser = window) {
    this.browser = browser
  }

  /** @returns {CalculatorValues} */
  read() {
    const params = new URL(this.browser.location.href).searchParams
    const values = { ...DEFAULT_CALCULATOR_VALUES }

    for (const name of CALCULATOR_VALUE_NAMES) {
      if (params.has(name)) values[name] = parseValue(name, params.get(name) ?? undefined)
    }

    for (const _name of CALCULATOR_VALUE_NAMES) {
      const errors = validateCalculatorValues(values)
      if (Object.keys(errors).length === 0) break

      for (const name of CALCULATOR_VALUE_NAMES) {
        if (errors[name]) values[name] = DEFAULT_CALCULATOR_VALUES[name]
      }
    }

    return values
  }

  /**
   * @param {Partial<CalculatorValues>} values
   * @returns {boolean}
   */
  replace(values) {
    const url = new URL(this.browser.location.href)
    const nextValues = { ...this.read(), ...values }

    if (Object.keys(validateCalculatorValues(nextValues)).length > 0) return false

    for (const name of CALCULATOR_VALUE_NAMES) {
      const value = nextValues[name]

      if (value === DEFAULT_CALCULATOR_VALUES[name]) {
        url.searchParams.delete(name)
      } else {
        url.searchParams.set(name, String(value))
      }
    }

    this.browser.history.replaceState(this.browser.history.state, '', url)
    return true
  }

  /**
   * @param {(values: CalculatorValues) => void} listener
   * @returns {() => void}
   */
  subscribe(listener) {
    const handlePopState = () => listener(this.read())

    this.browser.addEventListener('popstate', handlePopState)
    return () => this.browser.removeEventListener('popstate', handlePopState)
  }
}
