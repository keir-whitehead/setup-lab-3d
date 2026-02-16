import type { Monitor } from '../types';

interface MonitorCardProps {
  monitor: Monitor;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function MonitorCard({ monitor, isSelected, onSelect }: MonitorCardProps) {
  return (
    <div
      onClick={() => onSelect(monitor.id)}
      style={{
        background: isSelected
          ? 'rgba(129,140,248,0.08)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
        {monitor.name}
      </div>
      <div
        style={{
          fontSize: 10,
          color: '#818cf8',
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {monitor.resolution}
      </div>

      {isSelected && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.8,
          }}
        >
          <div>{monitor.refresh} · {monitor.panel}</div>
          <div>{monitor.colorGamut}</div>
          <div>{monitor.connection}</div>
          {monitor.features && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
              {monitor.features}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
