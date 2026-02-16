import type { CloudService } from '../types';

interface CloudPanelProps {
  services: CloudService[];
}

export default function CloudPanel({ services }: CloudPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {services.map((svc) => (
        <div
          key={svc.name}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 8,
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
            {svc.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.7,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>{svc.tier}</div>
            <div>{svc.use}</div>
            <div style={{ color: '#818cf8' }}>{svc.latency} · {svc.context}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
