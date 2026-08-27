<script lang="ts">
  import { calculateDayRate } from './lib/calculator.ts'
  import { CalculatorUrlState } from './lib/calculator-url-state.ts'
  import {
    DEFAULT_CALCULATOR_VALUES,
    InvalidCalculatorValues,
    type CalculatorErrors,
    type CalculatorInput,
  } from './lib/calculator-values.ts'

  const urlState = new CalculatorUrlState()
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
  const preciseMoney = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  let values: CalculatorInput = $state(urlState.read())
  let assumptionsOpen = $state(false)
  let copyStatus = $state('')

  const calculation = $derived(calculateDayRate(values))
  const errors: CalculatorErrors = $derived(
    calculation.status === 'error' && InvalidCalculatorValues.is(calculation.error)
      ? calculation.error.fields
      : {},
  )
  const result = $derived(calculation.status === 'ok' ? calculation.value : null)
  const calculationError = $derived(
    calculation.status === 'error'
      ? calculation.error.match({
          InvalidCalculatorValues: () => 'Correct the invalid fields to calculate a rate.',
          CalculationOutOfRange: (error) => error.message,
        })
      : '',
  )
  const hasAssumptionErrors = $derived(Object.keys(errors).some((name) => name !== 'salary'))

  $effect(() => {
    if (calculation.status === 'ok') urlState.replace(values)
  })

  $effect(() => {
    if (hasAssumptionErrors) assumptionsOpen = true
  })

  $effect(() => urlState.subscribe((nextValues) => (values = nextValues)))

  function resetAssumptions() {
    values = { ...DEFAULT_CALCULATOR_VALUES, salary: values.salary }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      copyStatus = 'Link copied.'
    } catch {
      copyStatus = 'Unable to copy link.'
    }

    setTimeout(() => (copyStatus = ''), 2000)
  }
</script>

<main>
  <header>
    <h1>Dayrate</h1>
    <p>Turn an annual salary into a freelance day rate, with the costs and time behind it included.</p>
  </header>

  <section class="calculator" aria-labelledby="calculator-heading">
    <h2 id="calculator-heading">Calculate your rate</h2>

    <label class="primary-field" for="salary">
      <span>Desired annual salary</span>
      <span class="money-input">
        <span>$</span>
        <input
          id="salary"
          type="number"
          min="0"
          step="any"
          required
          inputmode="decimal"
          aria-label="Desired annual salary in dollars"
          aria-invalid={errors.salary ? 'true' : undefined}
          aria-describedby={errors.salary ? 'salary-help salary-error' : 'salary-help'}
          bind:value={values.salary}
        />
      </span>
      <small id="salary-help">Before personal taxes</small>
      {#if errors.salary}<small class="error" id="salary-error">{errors.salary}</small>{/if}
    </label>

    <section class="result" aria-labelledby="result-heading">
      <div>
        <h2 id="result-heading">Suggested day rate</h2>
        {#if result}
          <output for="salary bonus benefits holidays sick-days non-billable">
            <strong>{money.format(result.dayRate)}</strong><span> / day</span>
          </output>
          <p>Equivalent to {preciseMoney.format(result.hourlyRate)} per hour.</p>
        {:else}
          <output>—</output>
          <p>{calculationError}</p>
        {/if}
      </div>
      <div class="share">
        <button type="button" class="secondary-button" onclick={copyLink} disabled={!result}>
          Copy link
        </button>
        <span class="copy-status" role="status">{copyStatus}</span>
      </div>
    </section>

    <details bind:open={assumptionsOpen}>
      <summary>
        <span>Adjust assumptions</span>
        <small class:error={hasAssumptionErrors}>
          {hasAssumptionErrors
            ? 'Some assumptions need attention.'
            : 'Benefits, time off, and non-billable work'}
        </small>
      </summary>

      <div class="assumptions">
        <label for="bonus">
          <span>Bonus</span>
          <span class="suffix-input">
            <input
              id="bonus"
              type="number"
              min="0"
              step="any"
              required
              inputmode="decimal"
              aria-label="Bonus percentage"
              aria-invalid={errors.bonus ? 'true' : undefined}
              aria-describedby={errors.bonus ? 'bonus-error' : undefined}
              bind:value={values.bonus}
            />
            <span>%</span>
          </span>
          {#if errors.bonus}<small class="error" id="bonus-error">{errors.bonus}</small>{/if}
        </label>

        <label for="benefits">
          <span>Benefits</span>
          <span class="suffix-input">
            <input
              id="benefits"
              type="number"
              min="0"
              step="any"
              required
              inputmode="decimal"
              aria-label="Benefits percentage"
              aria-invalid={errors.benefits ? 'true' : undefined}
              aria-describedby={errors.benefits ? 'benefits-error' : undefined}
              bind:value={values.benefits}
            />
            <span>%</span>
          </span>
          {#if errors.benefits}<small class="error" id="benefits-error">{errors.benefits}</small>{/if}
        </label>

        <label for="holidays">
          <span>Holidays</span>
          <span class="suffix-input">
            <input
              id="holidays"
              type="number"
              min="0"
              step="any"
              required
              inputmode="decimal"
              aria-label="Holiday allowance in days"
              aria-invalid={errors.holidays ? 'true' : undefined}
              aria-describedby={errors.holidays ? 'holidays-error' : undefined}
              bind:value={values.holidays}
            />
            <span>days</span>
          </span>
          {#if errors.holidays}<small class="error" id="holidays-error">{errors.holidays}</small>{/if}
        </label>

        <label for="sick-days">
          <span>Sick or contingency days</span>
          <span class="suffix-input">
            <input
              id="sick-days"
              type="number"
              min="0"
              step="any"
              required
              inputmode="decimal"
              aria-label="Sick or contingency allowance in days"
              aria-invalid={errors.sickDays ? 'true' : undefined}
              aria-describedby={errors.sickDays ? 'sick-days-error' : undefined}
              bind:value={values.sickDays}
            />
            <span>days</span>
          </span>
          {#if errors.sickDays}<small class="error" id="sick-days-error">{errors.sickDays}</small>{/if}
        </label>

        <label for="non-billable">
          <span>Non-billable time</span>
          <span class="suffix-input">
            <input
              id="non-billable"
              type="number"
              min="0"
              step="any"
              required
              inputmode="decimal"
              aria-label="Non-billable time percentage"
              aria-invalid={errors.nonBillable ? 'true' : undefined}
              aria-describedby={errors.nonBillable ? 'non-billable-error' : undefined}
              bind:value={values.nonBillable}
            />
            <span>%</span>
          </span>
          {#if errors.nonBillable}
            <small class="error" id="non-billable-error">{errors.nonBillable}</small>
          {/if}
        </label>
      </div>

      <button type="button" class="text-button" onclick={resetAssumptions}>Reset assumptions</button>
    </details>
  </section>

  <section class="breakdown" aria-labelledby="breakdown-heading">
    <h2 id="breakdown-heading">How this is calculated</h2>
    <p>
      Your salary target is adjusted for bonus and benefits, then divided by the working days you
      can realistically bill.
    </p>

    <dl>
      <div>
        <dt>Annual compensation target</dt>
        <dd>{result ? money.format(result.annualCompensation) : '—'}</dd>
      </div>
      <div>
        <dt>Estimated billable days</dt>
        <dd>{result ? result.billableDays.toFixed(1) : '—'}</dd>
      </div>
      <div>
        <dt>Rate before rounding</dt>
        <dd>{result ? preciseMoney.format(result.rawDayRate) : '—'}</dd>
      </div>
    </dl>

    <p class="note">The suggested day rate is rounded up to the nearest $5.</p>
  </section>
</main>
