import { NextPage } from "next";
import Script from "next/script";
import { useReducer, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";

import {
  getDayRate,
  getMoneyFormat,
  grossSalary,
  hourlyRate,
  getWorkingDays,
} from "../utils/formulas";
import Input from "../components/input";

export const initialState = {
  net: 0,
  bonus: 1,
  benefits: 20,
  sickdays: 7,
  holidays: 9,
  nonBillableTime: 20,
};

function reducer(state: any, { field, value }: any) {
  return {
    ...state,
    [field]: value,
  };
}

export default function Home(): React.ReactElement<NextPage> {
  const [dayrate, setDayrate] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { net, sickdays, holidays, nonBillableTime, bonus, benefits } = state;

  const handleChange = (e: any) => {
    dispatch({
      field: e.target.name,
      value: parseFloat(e.target.value) || 0,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setDayrate(getDayRate(state));
  };

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-93LT3GLL78"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-93LT3GLL78');
      `}
      </Script>
      <main className="mx-auto max-w-prose px-4">
        <div className="mb-8">
          <h1 className="font-xl font-medium">Suggested Dayrate</h1>
          <output className="text-3xl font-bold text-green-500">
            {getMoneyFormat(dayrate)}
          </output>
          <p className="text-sm text-gray-500">
            that&apos;s about {getMoneyFormat(hourlyRate(state))} an hour.
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              value={net}
              name="net"
              type="text"
              inputmode="numeric"
              pattern="^[0-9]*$"
              label="Desired Net Salary"
              onChange={handleChange}
            />
            <Accordion.Root type="single" collapsible={true}>
              <Accordion.Item value="foo">
                <Accordion.Header className="flex h-12 items-center">
                  <Accordion.Trigger className="text-xs font-bold uppercase">
                    Edit Formula Values
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <div className="space-y-2">
                    <Input
                      value={sickdays}
                      name="sickdays"
                      type="text"
                      inputmode="numeric"
                      pattern="^[0-9]*$"
                      label="Sickdays"
                      onChange={handleChange}
                    />
                    <Input
                      value={holidays}
                      name="holidays"
                      type="text"
                      inputmode="numeric"
                      pattern="^[0-9]*$"
                      label="Holidays"
                      onChange={handleChange}
                    />
                    <Input
                      value={nonBillableTime}
                      name="nonBillableTime"
                      type="text"
                      inputmode="numeric"
                      pattern="^[0-9]*$"
                      label="Non-Billable Time"
                      onChange={handleChange}
                      icon="%"
                    />
                    <Input
                      value={bonus}
                      name="bonus"
                      type="text"
                      inputmode="numeric"
                      pattern="^[0-9]*$"
                      label="Bonus Amount"
                      onChange={handleChange}
                      icon="%"
                    />
                    <Input
                      value={benefits}
                      name="benefits"
                      type="text"
                      inputmode="numeric"
                      pattern="^[0-9]*$"
                      label="Benefits Cost"
                      onChange={handleChange}
                      icon="%"
                    />
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center bg-green-500 py-2 px-4 text-white"
            >
              Show me the money
            </button>
          </form>
        </div>
        <div>
          <h2>What is this?</h2>
          <p>
            A single purpose calculator for determining a day rate. Hopefully
            this provides freelancers the confidence to charge what is necesary
            to reach their monetary goals.
          </p>
        </div>
        <div className="space-y-2">
          <h2>Why these numbers?</h2>
          <p>
            We start with your target salary of {getMoneyFormat(net)} before
            deductions (tax etc.). Most salaried positions come with some form
            of benefits (healthcare, pension contributions and more), and we
            estimate that replacing these would cost about 20% of that salary.
            Then, most professional salaried employees would hope for a bonus,
            again, we assume 1%. That leaves us with a target of{" "}
            {getMoneyFormat(grossSalary(state))} to make.
          </p>
          <p>
            Of the 365 days in a year, 104 are weekends.{" "}
            <a
              href="https://www.bls.gov/news.release/ebs.t05.htm"
              target="_blank"
              rel="noreferrer"
            >
              Professionals in the United States receive 8.5 days of paid
              holidays on average
            </a>
            , we can round that up to 9.
          </p>
          <p>
            The average number of unplanned (sick or otherwise) days worldwide
            is 6.4, but we’ll use 7 to be safe. That gives us{" "}
            {getMoneyFormat(grossSalary(state))} / {getWorkingDays(state)} days
            for a day rate of {getMoneyFormat(dayrate)}. You can round that up
            to the nearest $5 for the sake of sane accounting.
          </p>
        </div>
      </main>
    </>
  );
}
