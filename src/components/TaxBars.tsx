import React from 'react';
import { TaxComputation } from '../domain/tax/types';

interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
  title?: string;
}

const currency = (n: number) => '£' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const TaxBars: React.FC<{ result: TaxComputation }> = ({ result }) => {
  const total = result.preSacrificeGross || 0;
  if (total <= 0) return <div style={{ fontSize: 12 }}>No income to display.</div>;

  const tax = result.incomeTax.total;
  const ni = result.nationalInsurance.total;
  const cbCharge = result.childBenefit?.charge || 0;
  const pension = result.employeePensionAmount;
  const sacrifice = result.salarySacrificeAmount;
  const net = result.net;

  const distribution: Segment[] = [
    { key: 'sacrifice', label: 'Salary Sacrifice', value: sacrifice, color: '#8b5cf6' },
    { key: 'pension', label: 'Pension', value: pension, color: '#6366f1' },
    { key: 'tax', label: 'Income Tax', value: tax, color: '#dc2626' },
    { key: 'ni', label: 'NI', value: ni, color: '#f97316' },
    { key: 'cb', label: 'CB Charge', value: cbCharge, color: '#fb923c' },
    { key: 'net', label: 'Net', value: net, color: '#16a34a' }
  ].filter(s => s.value > 0);

  const paymentsTotal = tax + ni + cbCharge;
  const redirectedTotal = sacrifice + pension;

  const barStyle: React.CSSProperties = { display: 'flex', width: '100%', height: 32, borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #ddd' };
  const segmentStyle = (value: number, color: string): React.CSSProperties => ({ flex: value, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', whiteSpace: 'nowrap' });
  const legendItems = distribution.map(d => (
    <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <span style={{ width: 14, height: 14, background: d.color, display: 'inline-block', borderRadius: 3 }} />
      {d.label}: {currency(d.value)}
    </div>
  ));
  const pct = (v: number) => (v / total) * 100;

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, flex: 1, minWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0 }}>Allocation Overview</h3>
      <div style={{ fontSize: 12, color: '#444' }}>Pre‑sacrifice gross: {currency(total)}</div>
      <div>
        <div style={{ fontSize: 12, marginBottom: 4 }}>Full Distribution</div>
        <div role="img" aria-label="Full income distribution" style={barStyle}>
          {distribution.map(seg => (
            <div key={seg.key} style={{ ...segmentStyle(seg.value, seg.color), flex: seg.value }} title={`${seg.label}: ${currency(seg.value)} (${pct(seg.value).toFixed(1)}%)`}>
              {pct(seg.value) > 7 ? `${seg.label} ${pct(seg.value).toFixed(0)}%` : ''}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Payments to Government</div>
            <div style={barStyle} role="img" aria-label="Payments to government">
              {paymentsTotal > 0 ? (
                <>
                  {tax > 0 && <div style={segmentStyle(tax, '#dc2626')} title={`Income Tax: ${currency(tax)} (${pct(tax).toFixed(1)}% of gross)`}>{pct(tax) > 12 ? 'Tax' : ''}</div>}
                  {ni > 0 && <div style={segmentStyle(ni, '#f97316')} title={`NI: ${currency(ni)} (${pct(ni).toFixed(1)}% of gross)`}>{pct(ni) > 12 ? 'NI' : ''}</div>}
                  {cbCharge > 0 && <div style={segmentStyle(cbCharge, '#fb923c')} title={`Child Benefit Charge: ${currency(cbCharge)} (${pct(cbCharge).toFixed(1)}% of gross)`}>{pct(cbCharge) > 12 ? 'CB' : ''}</div>}
                </>
              ) : <div style={{ fontSize: 11, padding: 4 }}>None</div>}
            </div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{currency(paymentsTotal)} ({pct(paymentsTotal).toFixed(1)}%)</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Redirected (You Keep For Future)</div>
            <div style={barStyle} role="img" aria-label="Redirected contributions">
              {redirectedTotal > 0 ? (
                <>
                  {sacrifice > 0 && <div style={segmentStyle(sacrifice, '#8b5cf6')} title={`Salary Sacrifice: ${currency(sacrifice)} (${pct(sacrifice).toFixed(1)}% of gross)`}>{pct(sacrifice) > 12 ? 'Sacrifice' : ''}</div>}
                  {pension > 0 && <div style={segmentStyle(pension, '#6366f1')} title={`Pension: ${currency(pension)} (${pct(pension).toFixed(1)}% of gross)`}>{pct(pension) > 12 ? 'Pension' : ''}</div>}
                </>
              ) : <div style={{ fontSize: 11, padding: 4 }}>None</div>}
            </div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{currency(redirectedTotal)} ({pct(redirectedTotal).toFixed(1)}%)</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Net Take‑Home</div>
            <div style={barStyle} role="img" aria-label="Net take home">
              <div style={segmentStyle(net, '#16a34a')} title={`Net: ${currency(net)} (${pct(net).toFixed(1)}% of gross)`}>
                {pct(net) > 20 ? 'Net' : ''}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{currency(net)} ({pct(net).toFixed(1)}%)</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6, marginTop: 4 }}>
        {legendItems}
      </div>
    </div>
  );
};
