export type Values = {
  benefits: number;
  bonus: number;
  holidays: number;
  net: number;
  nonBillableTime: number;
  sickdays: number;
};

export function getPercent(n: number): number {
  return n / 100;
}

export function workingDays(
  holidays: number,
  sickdays: number,
  nonBillableTime: number,
): number {
  const DAYS = 365;
  const WEEKENDS = 104;
  // The amount of total days after weekends, estimated sick time, and holidays
  const BILLABLE_DAYS: number = DAYS - WEEKENDS - sickdays - holidays;
  // we we return a whole number for simplicities sake
  return Math.round(BILLABLE_DAYS - BILLABLE_DAYS * nonBillableTime);
}

export function targetSalary(
  gross: number,
  bonus: number,
  benefits: number,
): number {
  // The average annual bonus is about 1% of your salary
  const BONUS_AMT: number = gross * bonus;
  // The average cost to cover benefits that a typical employer would cover, like health insurance, is 20%
  const BENNY_AMT: number = gross * benefits;

  const TOTAL_AMT: number = gross + BONUS_AMT + BENNY_AMT;

  return Math.round(TOTAL_AMT);
}

export const hourlyRate = (vals: Values) =>
  Math.round(
    targetSalary(vals.net, getPercent(vals.bonus), getPercent(vals.benefits)) /
      workingDays(
        vals.holidays,
        vals.sickdays,
        getPercent(vals.nonBillableTime),
      ) /
      8,
  );

export const grossSalary = (vals: Values) =>
  targetSalary(vals.net, getPercent(vals.bonus), getPercent(vals.benefits));

export const getMoneyFormat = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
};

export const getDayRate = (vals: Values) =>
  Math.round(
    targetSalary(vals.net, getPercent(vals.bonus), getPercent(vals.benefits)) /
      workingDays(
        vals.holidays,
        vals.sickdays,
        getPercent(vals.nonBillableTime),
      ),
  );

export const getWorkingDays = (vals: Values) =>
  workingDays(vals.holidays, vals.sickdays, getPercent(vals.nonBillableTime));
