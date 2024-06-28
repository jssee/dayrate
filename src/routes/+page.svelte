<script lang="ts">
  import { getDayRate, getMoneyFormat, type Values } from "$lib/formulas";

  let values = $state<Values>({
    net: 0,
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
    <label>
      desired annual salary:
      <input
        onchange={handleInputChange}
        type="text"
        name="net"
        bind:value={values.net}
      />
    </label>
    <label>
      sick days:
      <input
        onchange={handleInputChange}
        type="text"
        name="sickdays"
        bind:value={values.sickdays}
      />
    </label>
    <label>
      holidays:
      <input
        onchange={handleInputChange}
        type="text"
        name="holidays"
        bind:value={values.holidays}
      />
    </label>
    <label>
      time not working:
      <input
        onchange={handleInputChange}
        type="text"
        name="nonBillableTime"
        bind:value={values.nonBillableTime}
      />
    </label>
    <label>
      bonus amount:
      <input
        type="text"
        onchange={handleInputChange}
        name="bonus"
        bind:value={values.bonus}
      />
    </label>
    <label>
      benefits:
      <input
        type="text"
        name="benefits"
        onchange={handleInputChange}
        bind:value={values.benefits}
      />
    </label>
    <button type="submit">Calculate</button>
  </form>
</main>

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
