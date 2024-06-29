<script lang="ts">
  import { getDayRate, getMoneyFormat, type Values } from "$lib/formulas";

  let values = $state<Values>({
    desiredAnnualSalary: 0,
    bonus: 1,
    benefits: 20,
    sickdays: 7,
    holidays: 9,
    nonBillableTime: 20,
  });

  let dayrate = $state(0);

  function handleInputChange(
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    values = {
      ...values,
      [e.currentTarget.name]: parseFloat(e.currentTarget.value) || 0,
    };
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    dayrate = getDayRate(values);
  }
</script>

<main>
  <h1>{getMoneyFormat(dayrate)}</h1>
  <form onsubmit={handleSubmit}>
    {#each Object.entries(values) as [name, _]}
      {@render field({ name })}
    {/each}
    <button type="submit">Calculate</button>
  </form>
</main>

{#snippet field({ name })}
  <label>
    {name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (first: string) => first.toUpperCase())}
    <input
      onfocusin={({ currentTarget }) => currentTarget.select()}
      onchange={handleInputChange}
      type="text"
      inputmode="numeric"
      pattern="^[0-9]*$"
      bind:value={values[name]}
      {name}
    />
  </label>
{/snippet}

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: max-content;
    margin-inline: auto;
  }

  form {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    max-width: max-content;
    margin-inline: auto;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
