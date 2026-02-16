import { useState } from 'react';
import type { Machine, AIModelResult } from '../types';
import { CHIP_PRICE_RANGES } from '../types';
import { getCloudMonthlyCost, getLocalMonthlyCost } from '../data/modelEconomics';

interface CostsPanelProps {
  machines: Machine[];
  aiModels: AIModelResult[];
}

export default function CostsPanel({ machines, aiModels }: CostsPanelProps) {
  const [electricityRate, setElectricityRate] = useState(0.30);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const [showSettings, setShowSettings] = useState(false);

  const activeMachines = machines.filter((machine) => machine.active);

  const hardwareCost = activeMachines.reduce((sum, machine) => {
    const range = CHIP_PRICE_RANGES[machine.chip];
    return sum + (range ? Math.round((range[0] + range[1]) / 2) : 0);
  }, 0);

  const cloudMonthlyCost = aiModels.reduce((sum, model) => {
    if (model.status === 'no') return sum;
    const modelCloud = getCloudMonthlyCost(model);
    return sum + (modelCloud ?? 0);
  }, 0);

  const localMonthlyCost = aiModels.reduce((sum, model) => {
    if (model.status === 'no') return sum;
    return sum + getLocalMonthlyCost(model.params, electricityRate, hoursPerDay);
  }, 0);
  const monthlySavings = cloudMonthlyCost - localMonthlyCost;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(hardwareCost / monthlySavings) : Infinity;

  const roiMonths = [3, 6, 12, 24, 36];
  const savingsPositive = monthlySavings >= 0;

  const getRoiColor = (progress: number, net: number): string => {
    if (net < 0) return '#ef4444';
    const hue = 48 + Math.round((Math.min(100, progress) / 100) * 72);
    return `hsl(${hue} 82% 56%)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: savingsPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: savingsPositive ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.35)',
          borderRadius: 14,
          padding: '14px 16px',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 11 }}>Monthly savings</div>
        <div
          style={{
            marginTop: 4,
            color: savingsPositive ? '#4ade80' : '#f87171',
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>↗</span>
          <span>${Math.round(monthlySavings).toLocaleString()}</span>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {[
          { label: 'Running locally', value: `$${localMonthlyCost.toFixed(0)}/mo`, color: '#22c55e' },
          { label: 'Cloud APIs', value: `$${cloudMonthlyCost.toFixed(0)}/mo`, color: '#ef4444' },
          { label: 'You save', value: `$${Math.round(monthlySavings).toLocaleString()}/mo`, color: '#4ade80' },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: row.label === 'You save' ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>{row.label}</span>
            <span
              style={{
                color: row.color,
                fontSize: row.label === 'You save' ? 16 : 13,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'rgba(129,140,248,0.1)',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: 12,
          padding: '12px 14px',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.66)', fontSize: 11, marginBottom: 8 }}>Hardware investment</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>Total hardware</span>
          <span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            ~${hardwareCost.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>Break-even</span>
          <span style={{ color: '#c7d2fe', fontSize: 13, fontWeight: 700 }}>
            {breakEvenMonths === Infinity ? 'Not reached' : `${breakEvenMonths} months`}
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 14px',
        }}
      >
        <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>ROI timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roiMonths.map((months) => {
            const recovered = Math.max(0, monthlySavings * months);
            const progress = hardwareCost > 0 ? Math.min(100, Math.round((recovered / hardwareCost) * 100)) : 0;
            const net = recovered - hardwareCost;
            const barColor = getRoiColor(progress, net);

            return (
              <div key={months}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 11 }}>{months} months</span>
                  <span
                    style={{
                      color: net >= 0 ? '#22c55e' : 'rgba(255,255,255,0.5)',
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {net >= 0 ? '+' : ''}${Math.round(net).toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: barColor,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.72)',
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '10px 12px',
        }}
      >
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.72)',
            fontSize: 12,
            fontWeight: 700,
            textAlign: 'left',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ⚙ Settings {showSettings ? '▾' : '▸'}
        </button>

        {showSettings && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Electricity rate (AUD/kWh)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={electricityRate}
                onChange={(event) => setElectricityRate(Math.max(0, Number(event.target.value) || 0))}
                style={{
                  width: 90,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f8fafc',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '6px 8px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Hours per day</span>
                <span style={{ color: '#c7d2fe', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {hoursPerDay}h/day
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={hoursPerDay}
                onChange={(event) => setHoursPerDay(Number(event.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
