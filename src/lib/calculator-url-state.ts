import {
  CALCULATOR_VALUE_NAMES,
  DEFAULT_CALCULATOR_VALUES,
  normalizeCalculatorValues,
  type CalculatorInput,
  type CalculatorValues,
} from './calculator.ts'

export { DEFAULT_CALCULATOR_VALUES } from './calculator.ts'

export interface CalculatorBrowser {
  location: { href: string }
  replaceUrl(url: URL): void
}

function createDefaultBrowser(): CalculatorBrowser {
  return {
    location: window.location,
    replaceUrl(url) {
      window.history.replaceState(window.history.state, '', url)
    },
  }
}

function parseUrlNumber(value: string | null): number | undefined {
  const trimmed = value?.trim()
  return trimmed ? Number(trimmed) : undefined
}

export class CalculatorUrlState {
  private readonly browser: CalculatorBrowser

  constructor(browser: CalculatorBrowser = createDefaultBrowser()) {
    this.browser = browser
  }

  read(): CalculatorValues {
    const params = new URL(this.browser.location.href).searchParams
    const values: CalculatorInput = {}

    for (const name of CALCULATOR_VALUE_NAMES) {
      values[name] = parseUrlNumber(params.get(name))
    }

    return normalizeCalculatorValues(values)
  }

  replace(values: CalculatorValues): void {
    const url = new URL(this.browser.location.href)

    for (const name of CALCULATOR_VALUE_NAMES) {
      const value = values[name]

      if (value === DEFAULT_CALCULATOR_VALUES[name]) {
        url.searchParams.delete(name)
      } else {
        url.searchParams.set(name, String(value))
      }
    }

    this.browser.replaceUrl(url)
  }
}
