import { computeChildBenefit, computeChildBenefitCharge } from '../src/domain/tax/childBenefit';
describe('Child Benefit Charge (1% per £200 over threshold)', () => {
  const gross = computeChildBenefit(2); // 2 children
  const start = 60000; // Should match CHILD_BENEFIT_CHARGE_START
  it('should not withdraw below threshold', () => {
    const res = computeChildBenefitCharge(start, gross);
    expect(res.charge).toBe(0);
    expect(res.withdrawnPercent).toBe(0);
  });
  it('should withdraw 1% for each £200 over threshold', () => {
    const res = computeChildBenefitCharge(start + 200, gross);
    expect(res.withdrawnPercent).toBe(1);
    expect(res.charge).toBeCloseTo(gross * 0.01, 2);
    const res5 = computeChildBenefitCharge(start + 1000, gross);
    expect(res5.withdrawnPercent).toBe(5);
    expect(res5.charge).toBeCloseTo(gross * 0.05, 2);
  });
  it('should cap at 100% withdrawal', () => {
    const res = computeChildBenefitCharge(start + 200 * 100, gross);
    expect(res.withdrawnPercent).toBe(100);
    expect(res.charge).toBeCloseTo(gross, 2);
    expect(res.net).toBeCloseTo(0, 2);
  });
});
import { computeTax } from '../src/domain/tax/engine';

describe('Tax engine core cliffs', () => {
  test('No taper below 100k', () => {
    const r = computeTax({ salary: 99_000, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0, children: 0 });
    expect(r.personalAllowance).toBe(12_570);
  });

  test('Allowance tapers above 100k', () => {
    const r = computeTax({ salary: 110_000, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0, children: 0 });
    expect(r.personalAllowance).toBeLessThan(12_570);
  });

  test('Allowance zero at 125,140', () => {
    const r = computeTax({ salary: 125_140, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0, children: 0 });
    expect(r.personalAllowance).toBe(0);
  });

  test('Child Benefit not withdrawn below 60k', () => {
    const r = computeTax({ salary: 59_000, bonus: 0, children: 2, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0 });
    expect(r.childBenefit?.charge || 0).toBe(0);
  });

  test('Child Benefit fully withdrawn at 80k', () => {
    const r = computeTax({ salary: 80_000, bonus: 0, children: 2, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0 });
    expect(r.childBenefit?.net).toBe(0);
  });

  test('Pension percent can restore allowance part', () => {
    const high = computeTax({ salary: 120_000, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0, children: 0 });
    const withPension = computeTax({ salary: 120_000, bonus: 0, pensionEmployee: 12, pensionIsPercent: true, salarySacrifice: 0, children: 0 }); // 12% of 120k = 14,400
    expect(withPension.personalAllowance).toBeGreaterThan(high.personalAllowance);
  });

  test('Higher pension percent lowers taxable income & income tax', () => {
    const base = computeTax({ salary: 90_000, bonus: 10_000, pensionEmployee: 5, pensionIsPercent: true, salarySacrifice: 0, children: 0 });
    const more = computeTax({ salary: 90_000, bonus: 10_000, pensionEmployee: 15, pensionIsPercent: true, salarySacrifice: 0, children: 0 });
    expect(more.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(more.incomeTax.total).toBeLessThan(base.incomeTax.total);
  });

  test('Salary sacrifice reduces NI and tracks savings', () => {
    const noSac = computeTax({ salary: 70_000, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 0, children: 0 });
    const withSac = computeTax({ salary: 70_000, bonus: 0, pensionEmployee: 0, pensionIsPercent: false, salarySacrifice: 5_000, children: 0 });
    expect(withSac.nationalInsurance.total).toBeLessThan(noSac.nationalInsurance.total);
    expect(withSac.niSavedFromSalarySacrifice).toBeGreaterThan(0);
    expect(withSac.totalSavingsAll).toBeGreaterThan(withSac.taxSavedFromPension); // should include NI component
  });
});
