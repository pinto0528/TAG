import React from 'react';
import { mockDocsAlerts, mockChoferes as mockDrivers, mockUnidades as mockFleet } from '../data/mockData';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

const Documentation = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Control de Riesgo y Documentación</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Upload Form (Mock) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Subir Documento</h3>

          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-body)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            marginBottom: '1rem'
          }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--bg-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
            <UploadCloud size={48} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <p style={{ fontWeight: 500 }}>Arrastra y suelta tu archivo aquí (PDF, JPG)</p>
            <p style={{ fontSize: '0.875rem' }}>o presiona para examinar</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            <select className="input-field">
              <option value="">Seleccionar Entidad...</option>
              <optgroup label="Choferes">
                {mockDrivers.map(d => <option key={`d-${d.id}`} value={d.id}>{d.name}</option>)}
              </optgroup>
              <optgroup label="Unidades">
                {mockFleet.map(f => <option key={`f-${f.id}`} value={f.id}>{f.plate} ({f.brand})</option>)}
              </optgroup>
            </select>
            <select className="input-field">
              <option value="">Tipo de Documento...</option>
              <option>Seguro</option>
              <option>VTV / RTO</option>
              <option>Carnet de Conducir</option>
              <option>LINTI</option>
              <option>Alta AFIP</option>
            </select>
            <input type="date" className="input-field" title="Fecha de Vencimiento" />
            <button style={{ width: '100%' }}>Guardar Documento</button>
          </div>
        </div>

        {/* Expirations Module */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Vencimientos Próximos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mockDocsAlerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                border: '1px solid var(--border-color)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  color: alert.severity === 'danger' ? 'var(--color-danger-text)' : 'var(--color-warning-text)',
                  backgroundColor: alert.severity === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                  padding: '0.75rem', borderRadius: '50%'
                }}>
                  <AlertCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>{alert.type}</strong>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{alert.expiration}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{alert.entity}</div>

                  {/* Progress bar mock */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(5, (alert.daysLeft / 60) * 100)}%`,
                      backgroundColor: alert.severity === 'danger' ? 'var(--color-danger-text)' : 'var(--color-warning-text)'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', textAlign: 'right', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                    Faltan {alert.daysLeft} días
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
