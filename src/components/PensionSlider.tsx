import React from 'react';

interface Props {
  value: number;
  max: number;
  step?: number; // default 1 for percent adjustments
  onChange(v: number): void;
}

export const PensionSlider: React.FC<Props> = ({ value, max, step = 1, onChange }) => {
  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
  <span>Pension Contribution (%)</span>
        <input
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
  <strong>{value}%</strong>
      </label>
    </div>
  );
};
