export interface UserInputs {
  salary: number;
  bonus: number;
  pensionEmployee: number; // amount (gross) employee contributes (relief at source simplified)
  pensionIsPercent: boolean;
  salarySacrifice: number; // amount directly sacrificed from gross salary
  children: number;
  partnerIncome?: number;
}

export interface IncomeTaxBandResult {
  rate: number;
  taxablePortion: number;
  tax: number;
}

export interface NIBandResult {
  rate: number;
  earningsPortion: number;
  contribution: number;
}

export interface ChildBenefitResult {
  gross: number;
  charge: number;
  net: number;
  withdrawnPercent: number; // 0–100
}

export interface TaxComputation {
  gross: number; // after salary sacrifice
  adjustedNetIncome: number; // simplified ANI
  adjustedNetIncomeBeforePension: number; // ANI before deducting employee pension
  personalAllowance: number;
  taxableIncome: number; // after allowance
  incomeTax: {
    total: number;
    bands: IncomeTaxBandResult[];
  };
  nationalInsurance: {
    total: number;
    bands: NIBandResult[];
  };
  childBenefit?: ChildBenefitResult;
  totalDeductions: number;
  net: number;
  effectiveAverageRate: number; // (income tax + NI + CB charge) / gross
  marginalRateEstimates: { bracketLabel: string; effectiveRate: number }[];
  notes: string[];
  employeePensionAmount: number;
  pensionPercentApplied?: number;
  salarySacrificeAmount: number;
  preSacrificeGross: number;
  taxSavedFromPension: number; // Income tax + CB charge reduction due to pension
  effectivePensionReliefRate: number; // taxSavedFromPension / employeePensionAmount
  niSavedFromSalarySacrifice: number; // NI saved due to salary sacrifice
  taxSavedFromSalarySacrifice: number; // Income tax saved due to salary sacrifice
  childBenefitChargeSaved: number; // Reduction in CB charge due to contributions (pension or sacrifice)
  totalSavingsAll: number; // Sum of income tax + NI + CB charge saved vs baseline with no pension & no sacrifice
  effectiveOverallReliefRate: number; // totalSavingsAll / (employeePensionAmount + salarySacrificeAmount)
  pensionSalarySacrificeAmount?: number; // portion of salary sacrifice that is pension via sacrifice
}

export interface ScenarioComparison {
  base: TaxComputation;
  adjusted: TaxComputation;
  deltas: {
    net: number;
    totalTax: number;
    childBenefitRecovered: number;
    allowanceRecovered: number;
  };
}
