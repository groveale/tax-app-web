import React, { useState, useMemo } from 'react';
import { NumberInput } from './components/NumberInput';
import { TaxSummaryCard } from './components/TaxSummaryCard';
import { TaxBars } from './components/TaxBars';
import { PensionSlider } from './components/PensionSlider';
import { computeTax } from './domain/tax/engine';

export const App: React.FC = () => {
  const [salary, setSalary] = useState(90_000);
  const [bonus, setBonus] = useState(10_000);
  const [children, setChildren] = useState(2);
  // Pension stored as percent (e.g. 5 => 5%)
  const [pensionPercent, setPensionPercent] = useState(5);
  const [salarySacrifice, setSalarySacrifice] = useState(0);

  const baseResult = useMemo(() => computeTax({
    salary,
    bonus,
    pensionEmployee: pensionPercent,
    pensionIsPercent: true,
    salarySacrifice,
    children
  }), [salary, bonus, pensionPercent, salarySacrifice, children]);

  // Scenario comparison removed; only showing monthly net for current inputs now.
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1>UK Tax Optimizer (PoC)</h1>
        <p style={{ fontSize: 12, color: '#666' }}>
          Educational illustration only. Not financial advice. Thresholds assumed for 2025/26; verify before relying.
        </p>
      </header>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NumberInput label="Salary (£)" value={salary} onChange={setSalary} step={1000} />
          <NumberInput label="Bonus (£)" value={bonus} onChange={setBonus} step={1000} />
          <NumberInput label="Children" value={children} onChange={v => setChildren(Math.max(0, v))} step={1} />
          <NumberInput label="Pension (%)" value={pensionPercent} onChange={v => setPensionPercent(Math.max(0, Math.min(100, v)))} step={1} />
          <div style={{ fontSize: 12, color: '#444' }}>≈ £{((salary + bonus) * (pensionPercent / 100)).toLocaleString(undefined, {maximumFractionDigits:0})} per year</div>
          <NumberInput label="Salary Sacrifice (£)" value={salarySacrifice} onChange={setSalarySacrifice} step={500} />
          <PensionSlider value={pensionPercent} max={40} onChange={v => setPensionPercent(v)} />
        </div>
  <TaxSummaryCard result={baseResult} />
  <TaxBars result={baseResult} />
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, flex: 1, minWidth: 260 }}>
          <h3 style={{ marginTop: 0 }}>Monthly Take‑Home</h3>
          <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 600 }}>£{Math.round(baseResult.net / 12).toLocaleString()}</p>
          <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
            Annual net £{baseResult.net.toLocaleString()} • Gross after sacrifice £{baseResult.gross.toLocaleString()}<br />
            Monthly gross (after sacrifice) £{Math.round(baseResult.gross / 12).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
