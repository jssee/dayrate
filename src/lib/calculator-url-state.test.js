import assert from 'node:assert/strict'
import test from 'node:test'

import { CalculatorUrlState, DEFAULT_CALCULATOR_VALUES } from './calculator-url-state.js'

/** @typedef {import('./calculator-url-state.js').CalculatorBrowser} CalculatorBrowser */

/**
 * @param {string} href
 * @returns {CalculatorBrowser & { popstate: () => void }}
 */
function createBrowser(href) {
  const listeners = /** @type {Set<() => void>} */ (new Set())
  const browser = /** @type {CalculatorBrowser & { popstate: () => void }} */ ({
    location: { href },
    history: {
      state: null,
      replaceState(state, _unused, url) {
        this.state = state
        browser.location.href = String(url)
      },
    },
    addEventListener(event, listener) {
      if (event === 'popstate') listeners.add(listener)
    },
    removeEventListener(event, listener) {
      if (event === 'popstate') listeners.delete(listener)
    },
    popstate() {
      for (const listener of listeners) listener()
    },
  })

  return browser
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
  assert.equal(state.replace(state.read()), true)
  assert.equal(browser.location.href, 'https://example.com/')
})

test('writes non-default values without removing unrelated parameters or the hash', () => {
  const browser = createBrowser('https://example.com/calculator?ref=friend&benefits=25#result')
  const state = new CalculatorUrlState(browser)

  state.replace({ salary: 100_000, bonus: 3 })

  assert.equal(
    browser.location.href,
    'https://example.com/calculator?ref=friend&benefits=25&salary=100000&bonus=3#result',
  )
})

test('does not write invalid calculator state', () => {
  const browser = createBrowser('https://example.com/?salary=100000')
  const state = new CalculatorUrlState(browser)

  assert.equal(state.replace({ nonBillable: 100 }), false)
  assert.equal(browser.location.href, 'https://example.com/?salary=100000')
})

test('notifies subscribers when browser history changes', () => {
  const browser = createBrowser('https://example.com/?salary=100000')
  const state = new CalculatorUrlState(browser)
  let salary = 0
  const unsubscribe = state.subscribe((values) => (salary = values.salary))

  browser.location.href = 'https://example.com/?salary=120000'
  browser.popstate()
  assert.equal(salary, 120_000)

  unsubscribe()
  browser.location.href = 'https://example.com/?salary=140000'
  browser.popstate()
  assert.equal(salary, 120_000)
})
