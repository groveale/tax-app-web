import React from 'react';

interface Props {
  label: string;
  value: number;
  onChange(v: number): void;
  min?: number;
  step?: number;
}

export const NumberInput: React.FC<Props> = ({ label, value, onChange, min = 0, step = 1000 }) => {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        style={{ padding: '4px 6px' }}
      />
    </label>
  );
};
