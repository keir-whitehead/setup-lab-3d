import { useMemo, useState } from 'react';
import type { AIModelResult } from '../types';
import { getCloudMonthlyCost, getLocalMonthlyCost } from '../data/modelEconomics';

interface AIModelTableProps {
  models: AIModelResult[];
  totalRam: number;
  activeMachineCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  general: 'General',
  reasoning: 'Reasoning',
  frontier: 'Frontier',
  small: 'Small',
  image: 'Image',
  audio: 'Audio',
};

const STATUS_COLORS: Record<AIModelResult['status'], string> = {
  fast: '#22c55e',
  runs: '#3b82f6',
  distributed: '#a855f7',
  tight: '#3b82f6',
  no: '#ef4444',
};

const parseSpeedMetric = (speed: string): number => {
  const match = speed.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : 0;
};

const isRunnable = (status: AIModelResult['status']): boolean => status !== 'no';

export default function AIModelTable({ models, totalRam, activeMachineCount }: AIModelTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return models
      .filter((model) => {
        const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter;
        const matchesSearch =
          query.length === 0 ||
          model.name.toLowerCase().includes(query) ||
          model.params.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((left, right) => {
        const leftRunnable = isRunnable(left.status);
        const rightRunnable = isRunnable(right.status);
        if (leftRunnable !== rightRunnable) return leftRunnable ? -1 : 1;
        return parseSpeedMetric(right.speed) - parseSpeedMetric(left.speed);
      });
  }, [models, search, categoryFilter]);

  const compatibleCount = filteredModels.filter((model) => isRunnable(model.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800 }}>What Can You Run?</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 4 }}>
          {compatibleCount} models compatible with your {totalRam}GB setup
        </div>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="⌕ Search models, params, quant..."
        style={{
          width: '100%',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
          color: '#f8fafc',
          fontSize: 12,
          padding: '10px 14px',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {Object.keys(CATEGORY_LABELS).map((category) => {
          const active = categoryFilter === category;
          return (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              style={{
                border: active ? '1px solid rgba(129,140,248,0.58)' : '1px solid rgba(255,255,255,0.09)',
                background: active ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.03)',
                color: active ? '#e2e8f0' : 'rgba(255,255,255,0.52)',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                padding: '6px 10px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredModels.map((model) => {
          const runnable = isRunnable(model.status);
          const cloudMonthly = getCloudMonthlyCost(model);
          const localMonthly = getLocalMonthlyCost(model.params);
          const savingsPct =
            cloudMonthly !== null && cloudMonthly > localMonthly
              ? Math.round(((cloudMonthly - localMonthly) / cloudMonthly) * 100)
              : null;

          const runsOnText = (() => {
            if (model.runsOn === 'exo cluster') return 'Requires: exo cluster';
            if (model.runsOnAllMachines && activeMachineCount > 0) return 'Runs on: All machines';
            if (model.runnableMachineCount > 1) return `Runs on: ${model.runnableMachineCount} machines`;
            if (model.runnableMachineCount === 1) return `Runs on: ${model.runsOn.split(',')[0]}`;
            return `Runs on: ${model.runsOn}`;
          })();

          const statusLine = runnable
            ? runsOnText
            : `Requires ${model.vramGB}GB`;

          return (
            <div
              key={model.name}
              style={{
                borderLeft: `3px solid ${STATUS_COLORS[model.status]}`,
                borderRadius: 10,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: runnable ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.012)',
                padding: '10px 12px',
                opacity: runnable ? 1 : 0.35,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 800 }}>{model.name}</div>
                <div
                  style={{
                    color: 'rgba(255,255,255,0.46)',
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'nowrap',
                  }}
                >
                  {model.params} {model.quant}
                </div>
              </div>

              <div style={{ color: runnable ? '#e2e8f0' : 'rgba(255,255,255,0.45)', fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                {model.speed}
              </div>

              <div style={{ color: runnable ? 'rgba(255,255,255,0.64)' : 'rgba(255,255,255,0.42)', fontSize: 11, marginTop: 3 }}>
                {statusLine}
              </div>

              {runnable && cloudMonthly !== null && savingsPct !== null && (
                <div style={{ color: 'rgba(255,255,255,0.56)', fontSize: 10, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Local: ${localMonthly.toFixed(0)}/mo vs Cloud: ${cloudMonthly.toFixed(0)}/mo - save {savingsPct}%
                </div>
              )}

              {runnable && cloudMonthly !== null && savingsPct === null && (
                <div style={{ color: 'rgba(255,255,255,0.46)', fontSize: 10, marginTop: 6 }}>
                  Cloud is cheaper for this model
                </div>
              )}

              {!runnable && (
                <div style={{ color: '#ef4444', fontSize: 10, marginTop: 6, fontWeight: 700 }}>
                  Requires {model.vramGB}GB
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
