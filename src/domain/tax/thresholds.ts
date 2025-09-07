// Centralized thresholds & rates (easier future updates)
// NOTE: Adjust once official 2025/26 figures confirmed.
export interface IncomeTaxBand {
  from: number;
  to?: number;
  rate: number; // e.g. 0.2
}

export const PERSONAL_ALLOWANCE = 12_570;
export const PERSONAL_ALLOWANCE_TAPER_START = 100_000;
export const PERSONAL_ALLOWANCE_TAPER_LOSS_PER = 2; // lose £1 per £2
export const PERSONAL_ALLOWANCE_FLOOR = 0;

// Bands here are applied to taxable income AFTER personal allowance.
// We express band spans relative to 0 taxable amount after PA.
export const INCOME_TAX_BANDS: IncomeTaxBand[] = [
  { from: 0, to: 37_700, rate: 0.2 },          // Basic (after allowance)
  { from: 37_700, to: 125_140 - PERSONAL_ALLOWANCE, rate: 0.4 }, // Higher
  { from: 125_140 - PERSONAL_ALLOWANCE, rate: 0.45 } // Additional
];

// National Insurance (Employee, Class 1) – assumed continuing rates
export const NI_PRIMARY_THRESHOLD = 12_570;
export const NI_UPPER_EARNINGS_LIMIT = 50_270;
export const NI_MAIN_RATE = 0.08; // 8%
export const NI_ADDITIONAL_RATE = 0.02; // 2%

// Child Benefit amounts (assumed carryover; update when official)
export const CHILD_BENEFIT_FIRST_CHILD_WEEKLY = 25.60;
export const CHILD_BENEFIT_ADDITIONAL_CHILD_WEEKLY = 16.95;
export const CHILD_BENEFIT_YEAR_WEEKS = 52;

// High Income Child Benefit Charge updated thresholds
export const CHILD_BENEFIT_CHARGE_START = 60_000;
export const CHILD_BENEFIT_CHARGE_END = 80_000; // fully removed by here

export interface TaxSystemConfig {
  taxYearLabel: string;
}

export const CONFIG: TaxSystemConfig = {
  taxYearLabel: '2025/26 (assumed)'
};
