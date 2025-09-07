import { computeTax } from './engine';
import { ScenarioComparison, UserInputs } from './types';

// If base.pensionIsPercent is true, newPensionValue is treated as a percent; otherwise as an amount (£)
export function comparePensionScenario(base: UserInputs, newPensionValue: number): ScenarioComparison {
  const baseRes = computeTax(base);
  const adjusted = computeTax({
    ...base,
    pensionEmployee: newPensionValue,
    pensionIsPercent: base.pensionIsPercent
  });
  return {
    base: baseRes,
    adjusted,
    deltas: {
      net: adjusted.net - baseRes.net,
      totalTax: (adjusted.incomeTax.total + adjusted.nationalInsurance.total) - (baseRes.incomeTax.total + baseRes.nationalInsurance.total),
      childBenefitRecovered: (adjusted.childBenefit?.net || 0) - (baseRes.childBenefit?.net || 0),
      allowanceRecovered: adjusted.personalAllowance - baseRes.personalAllowance
    }
  };
}
