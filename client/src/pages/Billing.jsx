import React, { useState } from 'react';
import { mockViajes, mockProveedores, mockFacturas } from '../data/mockData';
import { UploadCloud, FileText, Search } from 'lucide-react';

// Build a flat billing list from viajes remitos + facturas
const buildBillingDocs = () => {
  const docs = [];
  mockViajes.forEach(v => {
    if (v.remitos) {
      v.remitos.forEach(r => {
        const factura = r.factura_id ? mockFacturas.find(f => f.id === r.factura_id) : null;
        docs.push({ id: r.id, type: 'Remito', documentNumber: r.numero, tripId: v.id, file: `remito_${r.id}.pdf`, date: r.fecha, status: r.estado === 'conforme' ? 'Conforme' : 'Pendiente' });
        if (factura && !docs.find(d => d.type === 'Factura' && d.documentNumber === factura.numero)) {
          docs.push({ id: `f-${factura.id}`, type: 'Factura', documentNumber: factura.numero, tripId: v.id, file: `factura_${factura.id}.pdf`, date: factura.fecha_emision, status: factura.estado === 'pagada' ? 'Conforme' : 'Pendiente' });
        }
      });
    }
  });
  return docs;
};
const mockBilling = buildBillingDocs();

const Billing = () => {
  const [activeTab, setActiveTab] = useState('Todos');

  const documentTypes = ['Todos', 'Factura', 'Remito', 'Carta de Porte', 'Hoja de Ruta'];

  const getTripDetails = (tripId) => {
    const trip = mockViajes.find(t => t.id === tripId);
    if (!trip) return 'Desconocido';
    const prov = mockProveedores.find(p => p.id === trip.proveedor_id);
    return `Viaje #${tripId} (${prov?.razon_social || 'Varios'})`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Emitida': return <span className="badge info">{status}</span>;
      case 'Conforme': return <span className="badge success">{status}</span>;
      case 'Cerrada': return <span className="badge" style={{backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)'}}>{status}</span>;
      case 'Pendiente': return <span className="badge warning">{status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  }

  const filteredDocs = activeTab === 'Todos' ? mockBilling : mockBilling.filter(d => d.type === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Documentación y Facturación</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Upload Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Cargar Nuevo Documento</h3>
          
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-body)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            marginBottom: '1.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--bg-primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
            <UploadCloud size={48} style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <p style={{ fontWeight: 500 }}>Arrastra tu Factura, Remito o CP</p>
            <p style={{ fontSize: '0.875rem' }}>Formatos soportados: PDF, JPG, PNG</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <select className="input-field" defaultValue={activeTab === 'Todos' ? '' : activeTab}>
              <option value="">Tipo de Documento</option>
              {documentTypes.filter(t => t !== 'Todos').map(type => (
                <option key={type}>{type}</option>
              ))}
              <option>Orden de Carga</option>
            </select>
            <input type="text" className="input-field" placeholder="Número de Documento (Ej. FC-0001)" />
            <select className="input-field">
              <option value="">Vincular a un Viaje...</option>
              {mockViajes.map(t => <option key={t.id} value={t.id}>#{t.id} - {t.origen} a {t.destino}</option>)}
            </select>
            <button style={{ width: '100%', padding: '0.75rem' }}>Procesar y Guardar</button>
          </div>
        </div>

        {/* Existing Documents List */}
        <div className="card" style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.125rem', margin: '0 0 1rem' }}>Archivo Documental</h3>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              {documentTypes.map(tab => (
                 <button 
                  key={tab} 
                  className={activeTab === tab ? '' : 'outline'} 
                  onClick={() => setActiveTab(tab)}
                  style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
                 >
                   {tab}
                 </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" placeholder="Buscar por viaje o número..." style={{ paddingLeft: '2.5rem', width: '100%', maxWidth: '400px' }} />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="datatable">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nro Documento</th>
                  <th>Viaje Asignado</th>
                  <th>Fecha</th>
                  <th>Archivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: '500' }}>{doc.type}</td>
                    <td>{doc.documentNumber}</td>
                    <td>{getTripDetails(doc.tripId)}</td>
                    <td>{doc.date}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <FileText size={16} /> {doc.file}
                      </span>
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay documentos de este tipo cargados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Billing;
