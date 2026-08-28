import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CalculatorUrlState,
  DEFAULT_CALCULATOR_VALUES,
  type CalculatorBrowser,
} from './calculator-url-state.ts'

function createBrowser(href: string): CalculatorBrowser {
  const location = { href }

  return {
    location,
    replaceUrl(url) {
      location.href = String(url)
    },
  }
}

test('reads calculator values from the URL and supplies defaults', () => {
  const browser = createBrowser('https://example.com/?salary=100000&bonus=3&nonBillable=25')
  const state = new CalculatorUrlState(browser)

  assert.deepEqual(state.read(), {
    ...DEFAULT_CALCULATOR_VALUES,
    salary: 100_000,
    bonus: 3,
    nonBillable: 25,
  })
})

test('replaces invalid URL values with defaults', () => {
  const browser = createBrowser(
    'https://example.com/?salary=oops&holidays=-1&sickDays=260&nonBillable=100',
  )

  assert.deepEqual(new CalculatorUrlState(browser).read(), DEFAULT_CALCULATOR_VALUES)
})

test('treats blank URL values as missing rather than zero', () => {
  const browser = createBrowser('https://example.com/?bonus=&benefits=%20%20')
  const state = new CalculatorUrlState(browser)

  assert.deepEqual(state.read(), DEFAULT_CALCULATOR_VALUES)
  state.replace(state.read())
  assert.equal(browser.location.href, 'https://example.com/')
})

test('writes only supplied calculator values while preserving unrelated URL state', () => {
  const browser = createBrowser(
    'https://example.com/calculator?ref=friend&benefits=25&nonBillable=50#result',
  )
  const state = new CalculatorUrlState(browser)

  state.replace({ ...DEFAULT_CALCULATOR_VALUES, salary: 100_000, bonus: 3 })

  assert.equal(
    browser.location.href,
    'https://example.com/calculator?ref=friend&salary=100000&bonus=3#result',
  )
})
