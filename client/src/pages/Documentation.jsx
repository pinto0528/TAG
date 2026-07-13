import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

const Documentation = () => {
  const [choferes, setChoferes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    Promise.all([
      fetch(`${apiBase}/choferes`).then(r => r.json()),
      fetch(`${apiBase}/unidades`).then(r => r.json())
    ]).then(([choferesData, unidadesData]) => {
      setChoferes(choferesData.data || []);
      setUnidades(unidadesData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
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
                {choferes.map(d => <option key={`d-${d.id}`} value={d.id}>{d.nombre} {d.apellido}</option>)}
              </optgroup>
              <optgroup label="Unidades">
                {unidades.map(f => <option key={`f-${f.id}`} value={f.id}>{f.patente} ({f.marca})</option>)}
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
            {loading ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Cargando vencimientos...</div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Sin vencimientos registrados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
