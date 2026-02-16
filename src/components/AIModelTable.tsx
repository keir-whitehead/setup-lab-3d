import { useState } from 'react';
import type { AIModelResult } from '../types';

interface AIModelTableProps {
  models: AIModelResult[];
  totalRam: number;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  fast: { bg: '#22c55e20', color: '#22c55e', label: '● Fast' },
  runs: { bg: '#3b82f620', color: '#3b82f6', label: '● Runs' },
  distributed: { bg: '#c084fc20', color: '#c084fc', label: '● Distributed' },
  tight: { bg: '#f59e0b20', color: '#f59e0b', label: '● Tight' },
  no: { bg: '#ef444420', color: '#ef4444', label: '✕ No' },
};

const CATEGORY_ORDER = ['general', 'reasoning', 'frontier', 'small', 'image', 'audio'];
const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  reasoning: 'Reasoning',
  frontier: 'Frontier',
  small: 'Small',
  image: 'Image Generation',
  audio: 'Audio',
};

export default function AIModelTable({ models, totalRam }: AIModelTableProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped: Record<string, AIModelResult[]> = {};
  for (const m of models) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const localCount = models.filter((m) => m.status !== 'no').length;
  const totalSavings = models.reduce((s, m) => s + (m.monthlySavings ?? 0), 0);
  const usedVram = models
    .filter((m) => m.status !== 'no')
    .reduce((s, m) => s + parseFloat(m.vram.replace(/[^0-9.]/g, '')), 0);
  const vramPct = Math.min(100, Math.round((usedVram / totalRam) * 100));

  const toggle = (cat: string) => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Summary Bar */}
      <div style={{
        background: 'rgba(129,140,248,0.08)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700 }}>
            {localCount} models can run locally
          </span>
          <span style={{
            fontSize: 11, color: '#22c55e', fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ~${Math.round(totalSavings)}/mo savings
          </span>
        </div>
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4,
        }}>
          VRAM utilization (max single model)
        </div>
        <div style={{
          height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${vramPct}%`,
            background: vramPct > 80 ? '#ef4444' : vramPct > 50 ? '#f59e0b' : '#22c55e',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 3,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {totalRam}GB total unified memory
        </div>
      </div>

      {/* Grouped Models */}
      {CATEGORY_ORDER.filter((c) => grouped[c]).map((cat) => (
        <div key={cat}>
          <div
            onClick={() => toggle(cat)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', marginBottom: 6,
            }}
          >
            <span style={{
              fontSize: 9, color: 'rgba(255,255,255,0.3)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {collapsed[cat] ? '▶' : '▼'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)',
            }}>
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
            <span style={{
              fontSize: 9, color: 'rgba(255,255,255,0.15)',
            }}>
              ({grouped[cat].length})
            </span>
          </div>

          {!collapsed[cat] && grouped[cat].map((model) => {
            const style = STATUS_STYLES[model.status] ?? STATUS_STYLES.runs;
            const hasCloudCost = model.costPerMTokenInput && model.costPerMTokenOutput;
            const cloudMonthly = hasCloudCost
              ? ((model.costPerMTokenInput ?? 0) + (model.costPerMTokenOutput ?? 0)) * 50
              : null;
            const localMonthly = (model.localCostPerHour ?? 0.015) * 720;
            const savingsPct = cloudMonthly
              ? Math.round(((cloudMonthly - localMonthly) / cloudMonthly) * 100)
              : null;

            return (
              <div
                key={model.name}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 6,
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 4,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                    {model.name}
                  </div>
                  <span style={{
                    background: style.bg,
                    color: style.color,
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {style.label}
                  </span>
                </div>

                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.35)',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                }}>
                  <div>{model.params} · {model.quant} · {model.vram}</div>
                  <div style={{ color: model.status !== 'no' ? '#22c55e' : '#ef4444' }}>
                    {model.speed}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                    {model.runMode}
                  </div>
                </div>

                {/* Cost comparison */}
                {model.status !== 'no' && hasCloudCost && (
                  <div style={{
                    marginTop: 6, paddingTop: 6,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>Local </span>
                      <span style={{ color: '#22c55e' }}>${localMonthly.toFixed(0)}/mo</span>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>Cloud </span>
                      <span style={{ color: '#ef4444' }}>
                        ${cloudMonthly?.toFixed(0)}/mo
                      </span>
                    </div>
                    {savingsPct !== null && savingsPct > 0 && (
                      <div style={{
                        color: '#22c55e', fontWeight: 700,
                      }}>
                        {savingsPct}% saved
                      </div>
                    )}
                  </div>
                )}

                <div style={{
                  marginTop: 4, fontSize: 9,
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {model.desc}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
