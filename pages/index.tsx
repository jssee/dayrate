import * as React from "react";
import { NextPage } from "next";

/* import { targetSalary, workingDays } from "../utils/formulas"; */

const initialState = {
  rate: 0,
  gross: 0,
  sickdays: 7,
  holidays: 10,
  nonBillableTime: 0.2,
  bonus: 0.01,
  benefits: 0.2
};

function reducer(state: any, event: any) {
  switch (event.type) {
    case "update-sickdays":
      return { ...state, sickdays: event.payload };
    case "update-holidays":
      return { ...state, holidays: event.payload };
    case "update-nonBillableTime":
      return { ...state, nonBillableTime: event.payload };
    case "update-bonus":
      return { ...state, bonus: event.payload };
    case "update-benefits":
      return { ...state, benefits: event.payload };
    case "update-gross":
      return { ...state, gross: event.payload };
    case "update-rate":
      return { ...state, rate: event.payload };
    default:
      throw new Error();
  }
}

export default function(): React.ReactElement<NextPage> {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <main>
      <form>
        <label htmlFor="desired-gross">
          Enter your desired gross salary:
          <input
            id="desired-gross"
            name="desired-gross"
            type="number"
            onChange={(e: any) =>
              dispatch({ type: "update-gross", payload: e.value })
            }
          />
        </label>
        <input type="submit" value="Calculate" />
      </form>
      <h1>
        Your day rate should be:
        {state.rate}
      </h1>
    </main>
  );
}
