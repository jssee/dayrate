const DAYS_PER_YEAR = 365
const WEEKEND_DAYS_PER_YEAR = 104
export const WORKING_DAYS_PER_YEAR = DAYS_PER_YEAR - WEEKEND_DAYS_PER_YEAR
const HOURS_PER_DAY = 8

export function calculateAnnualCompensation(
  salary: number,
  bonusRate: number,
  benefitsRate: number,
): number {
  return salary * (1 + bonusRate + benefitsRate)
}

export function calculateBillableDays(
  holidays: number,
  sickDays: number,
  nonBillableRate: number,
): number {
  return (WORKING_DAYS_PER_YEAR - holidays - sickDays) * (1 - nonBillableRate)
}

export function calculateRawDayRate(annualCompensation: number, billableDays: number): number {
  return annualCompensation / billableDays
}

export function roundUpDayRate(dayRate: number, increment = 5): number {
  const quotient = dayRate / increment
  const nearestInteger = Math.round(quotient)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 4
  const adjustedQuotient =
    Math.abs(quotient - nearestInteger) <= tolerance ? nearestInteger : quotient

  return increment * Math.ceil(adjustedQuotient)
}

export function calculateHourlyRate(dayRate: number): number {
  return dayRate / HOURS_PER_DAY
}
