import {
  CALCULATOR_VALUE_NAMES,
  DEFAULT_CALCULATOR_VALUES,
  normalizeCalculatorValues,
  validateCalculatorValues,
  type CalculatorInput,
  type CalculatorValueName,
  type CalculatorValues,
} from './calculator-values.ts'

export { DEFAULT_CALCULATOR_VALUES } from './calculator-values.ts'

export interface CalculatorBrowser {
  location: { href: string }
  history: {
    state: unknown
    replaceState(state: unknown, unused: string, url?: string | URL | null): void
  }
  addEventListener(type: 'popstate', listener: () => void): void
  removeEventListener(type: 'popstate', listener: () => void): void
}

function parseValue(name: CalculatorValueName, value: string | number | undefined): number {
  if (typeof value === 'string' && value.trim() === '') return DEFAULT_CALCULATOR_VALUES[name]

  const number = Number(value)

  return Number.isFinite(number) ? number : DEFAULT_CALCULATOR_VALUES[name]
}

export class CalculatorUrlState {
  private readonly browser: CalculatorBrowser

  constructor(browser: CalculatorBrowser = window) {
    this.browser = browser
  }

  read(): CalculatorValues {
    const params = new URL(this.browser.location.href).searchParams
    const values: CalculatorValues = { ...DEFAULT_CALCULATOR_VALUES }

    for (const name of CALCULATOR_VALUE_NAMES) {
      if (params.has(name)) values[name] = parseValue(name, params.get(name) ?? undefined)
    }

    return normalizeCalculatorValues(values)
  }

  replace(values: CalculatorInput): boolean {
    const url = new URL(this.browser.location.href)
    const validation = validateCalculatorValues({ ...this.read(), ...values })

    if (validation.status === 'error') return false

    for (const name of CALCULATOR_VALUE_NAMES) {
      const value = validation.value[name]

      if (value === DEFAULT_CALCULATOR_VALUES[name]) {
        url.searchParams.delete(name)
      } else {
        url.searchParams.set(name, String(value))
      }
    }

    this.browser.history.replaceState(this.browser.history.state, '', url)
    return true
  }

  subscribe(listener: (values: CalculatorValues) => void): () => void {
    const handlePopState = () => listener(this.read())

    this.browser.addEventListener('popstate', handlePopState)
    return () => this.browser.removeEventListener('popstate', handlePopState)
  }
}
