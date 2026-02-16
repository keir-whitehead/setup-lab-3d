import { useState } from 'react';
import type { Machine, AIModelResult } from '../types';
import { CHIP_PRICE_RANGES } from '../types';

interface CostsPanelProps {
  machines: Machine[];
  aiModels: AIModelResult[];
}

export default function CostsPanel({ machines, aiModels }: CostsPanelProps) {
  const [electricityRate, setElectricityRate] = useState(0.30);
  const [hoursPerDay, setHoursPerDay] = useState(12);
  const activeMachines = machines.filter((m) => m.active);

  // Hardware cost
  const hardwareCost = activeMachines.reduce((sum, m) => {
    const range = CHIP_PRICE_RANGES[m.chip];
    return sum + (range ? Math.round((range[0] + range[1]) / 2) : 0);
  }, 0);

  // Monthly electricity estimate (kWh * rate)
  const avgPowerKwPerMachine = 0.09;
  const monthlyElectricity =
    activeMachines.length * avgPowerKwPerMachine * hoursPerDay * 30 * electricityRate;

  // Cloud equivalent monthly cost (sum of all runnable models)
  const runnableModels = aiModels.filter((m) => m.status !== 'no');
  const cloudMonthlyCost = runnableModels.reduce((sum, m) => {
    if (m.costPerMTokenInput && m.costPerMTokenOutput) {
      return sum + (m.costPerMTokenInput + m.costPerMTokenOutput) * 50;
    }
    return sum;
  }, 0);

  const localMonthlyCost = monthlyElectricity;
  const monthlySavings = cloudMonthlyCost - localMonthlyCost;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(hardwareCost / monthlySavings) : Infinity;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  };

  const labelSt: React.CSSProperties = {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  };

  const valueSt: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#e2e8f0',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
    marginTop: 16,
  };

  // ROI timeline
  const roiMonths = [3, 6, 12, 24, 36];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={sectionLabel}>Energy Inputs</div>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span style={labelSt}>Electricity rate (AUD/kWh)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={electricityRate}
              onChange={(e) => setElectricityRate(Math.max(0, Number(e.target.value) || 0))}
              style={{
                width: 90,
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: '#e2e8f0',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                padding: '5px 6px',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={labelSt}>Hours per day</span>
              <span style={{ ...valueSt, fontSize: 11, color: '#a5b4fc' }}>
                {hoursPerDay}h/day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Hardware Costs */}
      <div style={sectionLabel}>Hardware Investment</div>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: '6px 12px',
      }}>
        {activeMachines.map((m) => {
          const range = CHIP_PRICE_RANGES[m.chip];
          return (
            <div key={m.id} style={rowStyle}>
              <span style={labelSt}>{m.name} ({m.chip})</span>
              <span style={{ ...valueSt, fontSize: 11 }}>
                {range ? `$${range[0].toLocaleString()} – $${range[1].toLocaleString()}` : '—'}
              </span>
            </div>
          );
        })}
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ ...labelSt, fontWeight: 700, color: '#818cf8' }}>Total Hardware</span>
          <span style={{ ...valueSt, color: '#818cf8' }}>
            ~${hardwareCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Monthly Running Costs */}
      <div style={sectionLabel}>Monthly Costs</div>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: '6px 12px',
      }}>
        <div style={rowStyle}>
          <span style={labelSt}>Electricity ({activeMachines.length} machines, {hoursPerDay}h/day)</span>
          <span style={{ ...valueSt, color: '#22c55e' }}>${localMonthlyCost.toFixed(0)}/mo</span>
        </div>
        <div style={rowStyle}>
          <span style={labelSt}>Cloud API equivalent</span>
          <span style={{ ...valueSt, color: '#ef4444' }}>${cloudMonthlyCost.toFixed(0)}/mo</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={{ ...labelSt, fontWeight: 700, color: '#22c55e' }}>Monthly Savings</span>
          <span style={{ ...valueSt, color: '#22c55e' }}>
            ${Math.round(monthlySavings).toLocaleString()}/mo
          </span>
        </div>
      </div>

      {/* Break-even */}
      <div style={sectionLabel}>Break-even & ROI</div>
      <div style={{
        background: 'rgba(129,140,248,0.08)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Break-even point</span>
          <span style={{
            fontSize: 14, fontWeight: 800, color: '#818cf8',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {breakEvenMonths === Infinity ? '∞' : `${breakEvenMonths} months`}
          </span>
        </div>
      </div>

      {/* ROI Table */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: '6px 12px',
      }}>
        {roiMonths.map((months) => {
          const totalSaved = monthlySavings * months;
          const netRoi = totalSaved - hardwareCost;
          const roiPct = hardwareCost > 0 ? Math.round((netRoi / hardwareCost) * 100) : 0;
          return (
            <div key={months} style={rowStyle}>
              <span style={labelSt}>{months} months</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  color: netRoi >= 0 ? '#22c55e' : '#ef4444',
                }}>
                  {netRoi >= 0 ? '+' : ''}${Math.round(netRoi).toLocaleString()}
                </span>
                <span style={{
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                  color: netRoi >= 0 ? '#22c55e' : 'rgba(255,255,255,0.2)',
                  fontWeight: 700, width: 48, textAlign: 'right',
                }}>
                  {roiPct}% ROI
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{
        fontSize: 9, color: 'rgba(255,255,255,0.15)',
        marginTop: 12, lineHeight: 1.5,
        fontStyle: 'italic',
      }}>
        Estimates assume ~100M tokens/month usage across runnable models.
        Electricity assumes ~90W average per active machine.
        Cloud costs based on current API pricing per 1M tokens.
      </div>
    </div>
  );
}
