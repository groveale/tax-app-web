import {
  PERSONAL_ALLOWANCE,
  PERSONAL_ALLOWANCE_TAPER_START,
  PERSONAL_ALLOWANCE_TAPER_LOSS_PER,
  INCOME_TAX_BANDS,
  NI_PRIMARY_THRESHOLD,
  NI_UPPER_EARNINGS_LIMIT,
  NI_MAIN_RATE,
  NI_ADDITIONAL_RATE
} from './thresholds';
import { computeChildBenefit, computeChildBenefitCharge } from './childBenefit';
import {
  UserInputs,
  TaxComputation,
  IncomeTaxBandResult,
  NIBandResult
} from './types';

export function normalizeInputs(input: Partial<UserInputs>): UserInputs {
  return {
    salary: input.salary ?? 0,
    bonus: input.bonus ?? 0,
    pensionEmployee: input.pensionEmployee ?? 0,
    pensionIsPercent: input.pensionIsPercent ?? false,
    salarySacrifice: input.salarySacrifice ?? 0,
    children: input.children ?? 0,
    partnerIncome: input.partnerIncome
  };
}

export function computePersonalAllowance(adjustedNetIncomeBeforePA: number) {
  if (adjustedNetIncomeBeforePA <= PERSONAL_ALLOWANCE_TAPER_START) return PERSONAL_ALLOWANCE;
  const excess = adjustedNetIncomeBeforePA - PERSONAL_ALLOWANCE_TAPER_START;
  const reduction = Math.floor(excess / PERSONAL_ALLOWANCE_TAPER_LOSS_PER);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

export function computeIncomeTax(taxableAfterAllowance: number): { total: number; bands: IncomeTaxBandResult[] } {
  let remaining = taxableAfterAllowance;
  let total = 0;
  const bands: IncomeTaxBandResult[] = [];
  for (const band of INCOME_TAX_BANDS) {
    if (remaining <= 0) break;
    const upper = band.to ?? Number.POSITIVE_INFINITY;
    const span = upper - band.from;
    const portion = Math.max(0, Math.min(remaining, span));
    if (portion > 0) {
      const tax = portion * band.rate;
      bands.push({ rate: band.rate, taxablePortion: portion, tax });
      total += tax;
      remaining -= portion;
    }
  }
  return { total, bands };
}

export function computeNI(grossForNI: number): { total: number; bands: NIBandResult[] } {
  let total = 0;
  const bands: NIBandResult[] = [];
  if (grossForNI > NI_PRIMARY_THRESHOLD) {
    const mainPortion = Math.min(grossForNI, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD;
    if (mainPortion > 0) {
      const contrib = mainPortion * NI_MAIN_RATE;
      bands.push({ rate: NI_MAIN_RATE, earningsPortion: mainPortion, contribution: contrib });
      total += contrib;
    }
    if (grossForNI > NI_UPPER_EARNINGS_LIMIT) {
      const addl = grossForNI - NI_UPPER_EARNINGS_LIMIT;
      const contrib = addl * NI_ADDITIONAL_RATE;
      bands.push({ rate: NI_ADDITIONAL_RATE, earningsPortion: addl, contribution: contrib });
      total += contrib;
    }
  }
  return { total, bands };
}

function estimateMarginalRates(result: TaxComputation) {
  const notes: string[] = [];
  if (result.adjustedNetIncome > 100_000 && result.adjustedNetIncome < 125_140) notes.push('In Personal Allowance taper zone (effective ~60% marginal).');
  if (result.adjustedNetIncome > 60_000 && result.adjustedNetIncome < 80_000 && result.childBenefit?.gross) notes.push('In Child Benefit withdrawal zone.');
  result.notes.push(...notes);
  return [
    { bracketLabel: 'Base bands', effectiveRate: +(result.incomeTax.total / (result.taxableIncome || 1)).toFixed(3) },
    { bracketLabel: 'Overall effective', effectiveRate: result.effectiveAverageRate }
  ];
}

export function computeTax(inputsRaw: Partial<UserInputs>, opts: { computeSavings?: boolean } = {}): TaxComputation {
  const { computeSavings = true } = opts;
  const inputs = normalizeInputs(inputsRaw);
  // Convert pension percent if selected
  const grossPreSacrifice = inputs.salary + inputs.bonus;
  // Convert pension percent (applied to salary+bonus BEFORE sacrifice) else treat as fixed amount
  const employeePension = inputs.pensionIsPercent
    ? grossPreSacrifice * (inputs.pensionEmployee / 100)
    : inputs.pensionEmployee;
  const salarySacrifice = Math.min(inputs.salary, Math.max(0, inputs.salarySacrifice));
  const gross = grossPreSacrifice - salarySacrifice;

  // Adjusted net income (simplified): gross - (employee pension + salary sacrifice already reduced)
  const adjustedNetIncomeBeforePension = gross; // after salary sacrifice but before employee pension deduction
  const adjustedNetIncomeBeforePA = gross - employeePension;
  const personalAllowance = computePersonalAllowance(adjustedNetIncomeBeforePA);
  // Treat employee pension contributions as reducing taxable income (simplified gross contribution model).
  // Note: NI still calculated on gross after salary sacrifice, NOT reduced by employee pension (non-salary-sacrifice contributions don't reduce NI).
  const taxableIncome = Math.max(0, gross - employeePension - personalAllowance);

  const incomeTax = computeIncomeTax(taxableIncome);
  const ni = computeNI(gross); // salary sacrifice already removed

  const grossChildBenefit = computeChildBenefit(inputs.children);
  const childBenefitCharge = computeChildBenefitCharge(adjustedNetIncomeBeforePA, grossChildBenefit);

  const totalDeductions = incomeTax.total + ni.total + employeePension + salarySacrifice + childBenefitCharge.charge;
  const net = gross - incomeTax.total - ni.total - employeePension - childBenefitCharge.charge;
  const effectiveAverageRate = gross === 0 ? 0 : (incomeTax.total + ni.total + childBenefitCharge.charge) / gross;

  const computation: TaxComputation = {
    gross,
    adjustedNetIncome: adjustedNetIncomeBeforePA,
    adjustedNetIncomeBeforePension,
    personalAllowance,
    taxableIncome,
    incomeTax,
    nationalInsurance: ni,
    childBenefit: grossChildBenefit > 0 ? childBenefitCharge : undefined,
    totalDeductions,
    net,
    effectiveAverageRate,
    marginalRateEstimates: [],
    notes: [],
    employeePensionAmount: employeePension,
    pensionPercentApplied: inputs.pensionIsPercent ? inputs.pensionEmployee : undefined,
    salarySacrificeAmount: salarySacrifice,
  preSacrificeGross: grossPreSacrifice,
  taxSavedFromPension: 0,
  effectivePensionReliefRate: 0,
  niSavedFromSalarySacrifice: 0,
  taxSavedFromSalarySacrifice: 0,
  childBenefitChargeSaved: 0,
  totalSavingsAll: 0,
  effectiveOverallReliefRate: 0,
  pensionSalarySacrificeAmount: undefined
  };

  computation.marginalRateEstimates = estimateMarginalRates(computation);

  // Compute baseline without employee pension to estimate tax saved (income tax + CB charge component only)
  if (computeSavings) {
    // Baseline with no pension & no salary sacrifice for total savings perspective
    const baselineAll = computeTax({
      salary: inputs.salary,
      bonus: inputs.bonus,
      pensionEmployee: 0,
      pensionIsPercent: false,
      salarySacrifice: 0,
      children: inputs.children,
      partnerIncome: inputs.partnerIncome
    }, { computeSavings: false });

    const cbChargeCurrent = computation.childBenefit ? computation.childBenefit.charge : 0;
    const cbChargeBaselineAll = baselineAll.childBenefit ? baselineAll.childBenefit.charge : 0;
    const cbChargeSaved = Math.max(0, cbChargeBaselineAll - cbChargeCurrent);
    computation.childBenefitChargeSaved = cbChargeSaved;

    // NI savings purely from salary sacrifice
    const niSaved = Math.max(0, baselineAll.nationalInsurance.total - computation.nationalInsurance.total);
    computation.niSavedFromSalarySacrifice = niSaved;

    // Baseline with salary sacrifice only to isolate pension impact
    const baselineSacrificeOnly = computeTax({
      salary: inputs.salary,
      bonus: inputs.bonus,
      pensionEmployee: 0,
      pensionIsPercent: false,
      salarySacrifice: inputs.salarySacrifice,
      children: inputs.children,
      partnerIncome: inputs.partnerIncome
    }, { computeSavings: false });

    const incomeTaxSavedFromPension = Math.max(0,
      (baselineSacrificeOnly.incomeTax.total + (baselineSacrificeOnly.childBenefit?.charge || 0)) -
      (computation.incomeTax.total + (computation.childBenefit?.charge || 0))
    );
    computation.taxSavedFromPension = incomeTaxSavedFromPension;
    computation.effectivePensionReliefRate = employeePension > 0 ? incomeTaxSavedFromPension / employeePension : 0;

    const incomeTaxSavedFromSacrifice = Math.max(0,
      (baselineAll.incomeTax.total + (baselineAll.childBenefit?.charge || 0)) -
      (baselineSacrificeOnly.incomeTax.total + (baselineSacrificeOnly.childBenefit?.charge || 0))
    );
    computation.taxSavedFromSalarySacrifice = incomeTaxSavedFromSacrifice;

    const totalSaved = (baselineAll.incomeTax.total + (baselineAll.childBenefit?.charge || 0) + baselineAll.nationalInsurance.total)
      - (computation.incomeTax.total + (computation.childBenefit?.charge || 0) + computation.nationalInsurance.total);
    computation.totalSavingsAll = Math.max(0, totalSaved);
    const totalContrib = employeePension + salarySacrifice;
    computation.effectiveOverallReliefRate = totalContrib > 0 ? computation.totalSavingsAll / totalContrib : 0;
  }
  return computation;
}

export function simulatePensionChange(base: Partial<UserInputs>, pensionAmounts: number[]) {
  return pensionAmounts.map(p => computeTax({ ...base, pensionEmployee: p, pensionIsPercent: false }));
}
