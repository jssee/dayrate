import * as React from "react";
import { NextPage } from "next";

import { targetSalary, workingDays } from "../utils/formulas";

const initialState = {
  gross: 0,
  bonus: 0.01,
  benefits: 0.2,
  sickdays: 7,
  holidays: 10,
  nonBillableTime: 0.2
};

function reducer(state: any, { field, value }: any) {
  return {
    ...state,
    [field]: value
  };
}

export default function(): React.ReactElement<NextPage> {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { gross, sickdays, holidays, nonBillableTime, bonus, benefits } = state;

  const handleChange = (e: any) => {
    dispatch({
      field: e.target.name,
      value: parseFloat(e.target.value)
    });
  };

  return (
    <main>
      <label htmlFor="gross">
        Enter your desired gross salary:
        <input
          id="gross"
          name="gross"
          type="number"
          value={gross}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="sickdays">
        Sickdays:
        <input
          id="sickdays"
          name="sickdays"
          type="number"
          value={sickdays}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="holidays">
        Holidays:
        <input
          id="holidays"
          name="holidays"
          type="number"
          value={holidays}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="billableDays">
        Non-billable time:
        <input
          id="nonBillableTime"
          name="nonBillableTime"
          type="number"
          value={nonBillableTime}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="bonus">
        Bonus amount:
        <input
          id="bonus"
          name="bonus"
          type="number"
          value={bonus}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="benefits">
        Benefits Cost:
        <input
          id="benefits"
          name="benefits"
          type="number"
          value={benefits}
          onChange={handleChange}
        />
      </label>

      <h1>
        Target Salary: {targetSalary(gross, bonus, benefits)}
        <br />
        Working days: {workingDays(holidays, sickdays, nonBillableTime)}
        <br />
        Day rate:
        {Math.round(
          targetSalary(gross, bonus, benefits) /
            workingDays(holidays, sickdays, nonBillableTime)
        )}
      </h1>
    </main>
  );
}
