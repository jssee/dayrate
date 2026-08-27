const DAYS_PER_YEAR = 365
const WEEKEND_DAYS_PER_YEAR = 104
export const WORKING_DAYS_PER_YEAR = DAYS_PER_YEAR - WEEKEND_DAYS_PER_YEAR
const HOURS_PER_DAY = 8

/**
 * @param {number} salary
 * @param {number} bonusRate
 * @param {number} benefitsRate
 * @returns {number}
 */
export function calculateAnnualCompensation(salary, bonusRate, benefitsRate) {
  return salary * (1 + bonusRate + benefitsRate)
}

/**
 * @param {number} holidays
 * @param {number} sickDays
 * @param {number} nonBillableRate
 * @returns {number}
 */
export function calculateBillableDays(holidays, sickDays, nonBillableRate) {
  return (WORKING_DAYS_PER_YEAR - holidays - sickDays) * (1 - nonBillableRate)
}

/**
 * @param {number} annualCompensation
 * @param {number} billableDays
 * @returns {number}
 */
export function calculateRawDayRate(annualCompensation, billableDays) {
  return annualCompensation / billableDays
}

/**
 * @param {number} dayRate
 * @param {number} [increment=5]
 * @returns {number}
 */
export function roundUpDayRate(dayRate, increment = 5) {
  const quotient = dayRate / increment
  const nearestInteger = Math.round(quotient)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(quotient)) * 4
  const adjustedQuotient =
    Math.abs(quotient - nearestInteger) <= tolerance ? nearestInteger : quotient

  return increment * Math.ceil(adjustedQuotient)
}

/**
 * @param {number} dayRate
 * @returns {number}
 */
export function calculateHourlyRate(dayRate) {
  return dayRate / HOURS_PER_DAY
}
