<script lang="ts">
  import {
    DEFAULT_CALCULATOR_VALUES,
    calculateDayRate,
    type CalculatorErrors,
    type CalculatorInput,
    type CalculatorValueName,
  } from './lib/calculator.ts'
  import { CalculatorUrlState } from './lib/calculator-url-state.ts'

  type AssumptionName = Exclude<CalculatorValueName, 'salary'>

  const assumptionFields = [
    {
      name: 'bonus',
      id: 'bonus',
      label: 'Bonus',
      suffix: '%',
      ariaLabel: 'Bonus percentage',
    },
    {
      name: 'benefits',
      id: 'benefits',
      label: 'Benefits',
      suffix: '%',
      ariaLabel: 'Benefits percentage',
    },
    {
      name: 'holidays',
      id: 'holidays',
      label: 'Holidays',
      suffix: 'days',
      ariaLabel: 'Holiday allowance in days',
    },
    {
      name: 'sickDays',
      id: 'sick-days',
      label: 'Sick or contingency days',
      suffix: 'days',
      ariaLabel: 'Sick or contingency allowance in days',
    },
    {
      name: 'nonBillable',
      id: 'non-billable',
      label: 'Non-billable time',
      suffix: '%',
      ariaLabel: 'Non-billable time percentage',
    },
  ] as const satisfies readonly {
    name: AssumptionName
    id: string
    label: string
    suffix: string
    ariaLabel: string
  }[]

  const urlState = new CalculatorUrlState()
  const initialValues = urlState.read()
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

  let values: CalculatorInput = $state.raw(initialValues)
  let copyStatus = $state('')

  const outcome = $derived(calculateDayRate(values))
  const errors: CalculatorErrors = $derived(outcome.kind === 'invalid' ? outcome.fields : {})
  const result = $derived(outcome.kind === 'calculated' ? outcome.breakdown : null)
  const calculationError = $derived(
    outcome.kind === 'invalid'
      ? 'Correct the invalid fields to calculate a rate.'
      : outcome.kind === 'out-of-range'
        ? 'These values are outside the range that can be calculated reliably.'
        : '',
  )
  const hasAssumptionErrors = $derived(assumptionFields.some(({ name }) => errors[name]))

  urlState.replace(initialValues)

  function updateValues(nextValues: CalculatorInput) {
    values = nextValues
    if (outcome.kind === 'calculated') urlState.replace(outcome.values)
  }

  function updateValue(name: CalculatorValueName, value: number | undefined) {
    updateValues({ ...values, [name]: value })
  }

  function handlePopState() {
    updateValues(urlState.read())
  }

  function resetAssumptions() {
    updateValues({ ...DEFAULT_CALCULATOR_VALUES, salary: values.salary })
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

<svelte:window onpopstate={handlePopState} />

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
          bind:value={() => values.salary, (salary) => updateValue('salary', salary)}
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

    <details>
      <summary>
        <span>Adjust assumptions</span>
        <small class={{ error: hasAssumptionErrors }}>
          {hasAssumptionErrors
            ? 'Some assumptions need attention.'
            : 'Benefits, time off, and non-billable work'}
        </small>
      </summary>

      <div class="assumptions">
        {#each assumptionFields as field (field.name)}
          <label for={field.id}>
            <span>{field.label}</span>
            <span class="suffix-input">
              <input
                id={field.id}
                type="number"
                min="0"
                step="any"
                required
                inputmode="decimal"
                aria-label={field.ariaLabel}
                aria-invalid={errors[field.name] ? 'true' : undefined}
                aria-describedby={errors[field.name] ? `${field.id}-error` : undefined}
                bind:value={() => values[field.name], (value) => updateValue(field.name, value)}
              />
              <span>{field.suffix}</span>
            </span>
            {#if errors[field.name]}
              <small class="error" id={`${field.id}-error`}>{errors[field.name]}</small>
            {/if}
          </label>
        {/each}
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
