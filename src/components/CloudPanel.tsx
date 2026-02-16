import type { CloudService } from '../types';

interface CloudPanelProps {
  services: CloudService[];
}

export default function CloudPanel({ services }: CloudPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {services.map((service) => (
        <div
          key={service.name}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ color: '#f8fafc', fontSize: 14, fontWeight: 800 }}>{service.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.54)', fontSize: 11, marginTop: 2 }}>{service.tier}</div>

          <div
            style={{
              marginTop: 8,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 10px',
              fontSize: 11,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.68)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Use case:</span> {service.use}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.68)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Model:</span> {service.model}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.68)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Context:</span> {service.context}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.68)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Pricing:</span> {service.pricing}
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          borderRadius: 10,
          padding: '10px 12px',
          border: '1px solid rgba(129,140,248,0.25)',
          background: 'rgba(129,140,248,0.1)',
          color: 'rgba(255,255,255,0.74)',
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        Cloud complements local - use cloud for frontier capability, local for privacy + cost savings
      </div>
    </div>
  );
}
