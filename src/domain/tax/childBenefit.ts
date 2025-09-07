import {
  CHILD_BENEFIT_ADDITIONAL_CHILD_WEEKLY,
  CHILD_BENEFIT_CHARGE_END,
  CHILD_BENEFIT_CHARGE_START,
  CHILD_BENEFIT_FIRST_CHILD_WEEKLY,
  CHILD_BENEFIT_YEAR_WEEKS
} from './thresholds';

export function computeChildBenefit(children: number): number {
  if (children <= 0) return 0;
  const first = CHILD_BENEFIT_FIRST_CHILD_WEEKLY * CHILD_BENEFIT_YEAR_WEEKS;
  const rest = (children - 1) * CHILD_BENEFIT_ADDITIONAL_CHILD_WEEKLY * CHILD_BENEFIT_YEAR_WEEKS;
  return first + rest;
}

export function computeChildBenefitCharge(adjustedNetIncome: number, grossChildBenefit: number) {
  if (grossChildBenefit === 0) {
    return { gross: 0, charge: 0, net: 0, withdrawnPercent: 0 };
  }
  if (adjustedNetIncome <= CHILD_BENEFIT_CHARGE_START) {
    return { gross: grossChildBenefit, charge: 0, net: grossChildBenefit, withdrawnPercent: 0 };
  }
  if (adjustedNetIncome >= CHILD_BENEFIT_CHARGE_END) {
    return { gross: grossChildBenefit, charge: grossChildBenefit, net: 0, withdrawnPercent: 100 };
  }
  const range = CHILD_BENEFIT_CHARGE_END - CHILD_BENEFIT_CHARGE_START; // 20k
  const excess = adjustedNetIncome - CHILD_BENEFIT_CHARGE_START;
  const withdrawnPercent = Math.min(1, excess / range);
  const charge = grossChildBenefit * withdrawnPercent;
  return {
    gross: grossChildBenefit,
    charge,
    net: grossChildBenefit - charge,
    withdrawnPercent: withdrawnPercent * 100
  };
}
