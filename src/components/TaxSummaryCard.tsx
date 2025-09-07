import React from 'react';
import { TaxComputation } from '../domain/tax/types';

export const TaxSummaryCard: React.FC<{ result: TaxComputation }> = ({ result }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, flex: 1, minWidth: 280 }}>
      <h3>Summary</h3>
      <p><strong>Gross (after sacrifice):</strong> £{result.gross.toLocaleString()}</p>
      <p><strong>Net:</strong> £{result.net.toLocaleString()}</p>
      <p><strong>Effective Rate:</strong> {(result.effectiveAverageRate * 100).toFixed(1)}%</p>
      <p><strong>Personal Allowance:</strong> £{result.personalAllowance.toLocaleString()}</p>
      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer' }}>Pension Impact</summary>
        <div style={{ fontSize: 12, lineHeight: 1.4, marginTop: 6 }}>
          <div>Pre‑sacrifice gross: £{result.preSacrificeGross.toLocaleString()}</div>
          {result.salarySacrificeAmount > 0 && (
            <div>Minus salary sacrifice: £{result.salarySacrificeAmount.toLocaleString()} → Gross after sacrifice: £{result.gross.toLocaleString()}</div>
          )}
          <div>
            Employee pension {result.pensionPercentApplied != null ? `(${result.pensionPercentApplied}% )` : ''}: £{result.employeePensionAmount.toLocaleString()}
          </div>
          <div>Adjusted Net Income before pension: £{result.adjustedNetIncomeBeforePension.toLocaleString()}</div>
          <div>Adjusted Net Income after pension: £{result.adjustedNetIncome.toLocaleString()}</div>
          <div>Personal Allowance applied: £{result.personalAllowance.toLocaleString()}</div>
          <div>Taxable income: £{result.taxableIncome.toLocaleString()}</div>
          {result.employeePensionAmount > 0 && (
            <div style={{ marginTop: 4 }}>
              Tax saved via pension (Income Tax + Child Benefit charge): £{result.taxSavedFromPension.toLocaleString()} ({(result.effectivePensionReliefRate * 100).toFixed(1)}% effective relief)
            </div>
          )}
          {(result.salarySacrificeAmount > 0) && (
            <div style={{ marginTop: 4 }}>
              Salary sacrifice savings: Income Tax £{result.taxSavedFromSalarySacrifice.toLocaleString()} + NI £{result.niSavedFromSalarySacrifice.toLocaleString()}
            </div>
          )}
          {(result.employeePensionAmount + result.salarySacrificeAmount) > 0 && (
            <div style={{ marginTop: 6, fontWeight: 600 }}>
              Total savings (Tax + NI + CB charge): £{result.totalSavingsAll.toLocaleString()} (Overall effective relief {(result.effectiveOverallReliefRate * 100).toFixed(1)}%)
            </div>
          )}
          {result.childBenefit && (
            <div style={{ marginTop: 4 }}>Child Benefit charge based on ANI £{result.adjustedNetIncome.toLocaleString()}</div>
          )}
        </div>
      </details>
      {result.childBenefit && (
        <p>
          <strong>Child Benefit:</strong> Net £{result.childBenefit.net.toLocaleString()} (Charge £{result.childBenefit.charge.toLocaleString()})
        </p>
      )}
      <details>
        <summary>Breakdown</summary>
        <ul>
          <li>Income Tax: £{result.incomeTax.total.toLocaleString()}</li>
          <li>NI: £{result.nationalInsurance.total.toLocaleString()}</li>
        </ul>
      </details>
      {result.notes.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {result.notes.map(n => <div key={n} style={{ fontSize: 12, color: '#555' }}>{n}</div>)}
        </div>
      )}
    </div>
  );
};
