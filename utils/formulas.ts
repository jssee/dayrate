export function getPercent(n: number): number {
  return n / 100;
}

export function workingDays(holidays: number): number {
  const DAYS = 365;
  const WEEKENDS = 104;

  // On average, workers in private industry received 7 days of sick leave per year at 1 year of service.
  // source: https://www.bls.gov/opub/ted/2019/private-industry-workers-with-sick-leave-benefits-received-8-days-per-year-at-20-years-of-service.htm
  const SICK_DAYS = 7;

  // We estimate that 20% of time spent is doing non-billable work
  const nonBillableTime = 0.2;

  // The amount of total days after weekends, estimated sick time, and holidays
  const billableDays: number = DAYS - WEEKENDS - SICK_DAYS - holidays;

  // we we return a whole number for simplicities sake
  return Math.round(billableDays - billableDays * nonBillableTime);
}

export function targetSalary(gross: number): number {
  // The average annual bonus is about 1% of your salary
  const BONUS_AMT: number = gross * 0.01;

  // The average cost to cover benefits that a typical employer would cover, like health insurance, is 20%
  const BENNY_AMT: number = gross * 0.2;

  return Math.round(BONUS_AMT + BENNY_AMT + gross);
}

