import { NextPage } from "next";
import { useReducer } from "react";

import { targetSalary, workingDays } from "../utils/formulas";
import Input from "../components/input";

export const initialState = {
  net: 0,
  bonus: 0.01,
  benefits: 0.2,
  sickdays: 7,
  holidays: 10,
  nonBillableTime: 0.2,
};

function reducer(state: any, { field, value }: any) {
  return {
    ...state,
    [field]: value,
  };
}

export default function Home(): React.ReactElement<NextPage> {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { net, sickdays, holidays, nonBillableTime, bonus, benefits } = state;

  const handleChange = (e: any) => {
    dispatch({
      field: e.target.name,
      value: parseFloat(e.target.value),
    });
  };

  return (
    <main className="mx-auto max-w-prose px-4">
      <div className="mb-8">
        <h1 className="font-xl font-medium">Suggested Dayrate</h1>
        <output className="text-3xl font-bold text-green-500">
          {Math.round(
            targetSalary(net, bonus, benefits) /
              workingDays(holidays, sickdays, nonBillableTime)
          )}
        </output>
      </div>
      <output hidden={true}>
        Gross Salary: {targetSalary(net, bonus, benefits)}
        <br />
        Working days: {workingDays(holidays, sickdays, nonBillableTime)}
        <br />
        Day rate:
        {Math.round(
          targetSalary(net, bonus, benefits) /
            workingDays(holidays, sickdays, nonBillableTime)
        )}
        <br />
        Hourly rate:
        {Math.round(
          targetSalary(net, bonus, benefits) /
            workingDays(holidays, sickdays, nonBillableTime) /
            8
        )}
      </output>
      <div>
        <form className="space-y-2">
          <Input
            value={net}
            name="net"
            type="number"
            label="Desired Net Salary"
            onChange={handleChange}
          />
          <Input
            value={sickdays}
            name="sickdays"
            type="number"
            label="Sickdays"
            onChange={handleChange}
          />
          <Input
            value={holidays}
            name="holidays"
            type="number"
            label="Holidays"
            onChange={handleChange}
          />
          <Input
            value={nonBillableTime}
            name="nonBillableTime"
            type="number"
            label="Non-Billable Time"
            onChange={handleChange}
          />
          <Input
            value={bonus}
            name="bonus"
            type="number"
            label="Bonus Amount"
            onChange={handleChange}
          />
          <Input
            value={benefits}
            name="benefits"
            type="number"
            label="Benefits Cost"
            onChange={handleChange}
          />
        </form>
      </div>
    </main>
  );
}
