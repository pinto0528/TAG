import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';
import { UploadCloud, FileText, Search, Plus, X } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-AR');
};

const Billing = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    liquidacion_id: '',
    numero: '',
    tipo: 'A',
    punto_venta: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    monto_neto: 0,
    iva: 0,
    monto_total: 0,
    estado: 'pendiente',
    notas: '',
  });

  const [liquidaciones, setLiquidaciones] = useState([]);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/facturas`, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        setFacturas(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLiquidaciones = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/liquidaciones`, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        setLiquidaciones(data.filter(l => l.estado === 'pendiente'));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchFacturas(); }, []);

  const handleCreateFactura = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          liquidacion_id: '', numero: '', tipo: 'A', punto_venta: '',
          fecha_emision: new Date().toISOString().split('T')[0],
          fecha_vencimiento: '', monto_neto: 0, iva: 0, monto_total: 0,
          estado: 'pendiente', notas: '',
        });
        fetchFacturas();
      } else {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err.errors || err.message));
      }
    } catch (e) { console.error(e); }
    finally { setFormLoading(false); }
  };

  const handleOpenForm = () => {
    fetchLiquidaciones();
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pagada': return <span className="badge success">Pagada</span>;
      case 'pendiente': return <span className="badge warning">Pendiente</span>;
      case 'anulada': return <span className="badge danger">Anulada</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const filteredFacturas = facturas.filter(f => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNumero = f.numero?.toLowerCase().includes(q);
      const matchLiq = f.liquidacion?.numero?.toLowerCase().includes(q);
      const matchEntidad = f.liquidacion?.cliente?.razon_social?.toLowerCase().includes(q)
        || f.liquidacion?.proveedor?.razon_social?.toLowerCase().includes(q);
      if (!matchNumero && !matchLiq && !matchEntidad) return false;
    }
    if (activeTab !== 'Todos') {
      const tipoMap = { 'Factura A': 'A', 'Factura B': 'B', 'Factura C': 'C' };
      if (tipoMap[activeTab] && f.tipo !== tipoMap[activeTab]) return false;
    }
    return true;
  });

  const tabs = ['Todos', 'Factura A', 'Factura B', 'Factura C'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-in-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Facturación
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Facturas generadas a partir de liquidaciones.
          </p>
        </div>
        <button onClick={handleOpenForm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}>
          <Plus size={18} /> Nueva Factura
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-body)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? '' : 'outline'}
              style={{
                border: 'none',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por número, liquidación o entidad..."
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', flex: 1 }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando facturas...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="datatable">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Tipo</th>
                  <th>Liquidación</th>
                  <th>Entidad</th>
                  <th>Fecha Emisión</th>
                  <th style={{ textAlign: 'right' }}>Monto Total</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FileText size={48} style={{ opacity: 0.3 }} />
                        <p>No hay facturas registradas.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFacturas.map((f) => (
                    <tr key={f.id} className="table-row-hover">
                      <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{f.numero}</td>
                      <td><span className="badge" style={{ backgroundColor: 'var(--bg-body)' }}>Factura {f.tipo}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{f.liquidacion?.numero || '—'}</td>
                      <td>{f.liquidacion?.cliente?.razon_social || f.liquidacion?.proveedor?.razon_social || '—'}</td>
                      <td>{formatDate(f.fecha_emision)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(f.monto_total)}</td>
                      <td style={{ textAlign: 'center' }}>{getStatusBadge(f.estado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Factura Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Nueva Factura</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateFactura} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Liquidación Asociada</label>
                <select className="input-field" value={formData.liquidacion_id} onChange={e => setFormData({ ...formData, liquidacion_id: e.target.value })} required>
                  <option value="">Seleccionar liquidación pendiente...</option>
                  {liquidaciones.map(l => (
                    <option key={l.id} value={l.id}>{l.numero} — {l.cliente?.razon_social || l.proveedor?.razon_social} ({formatCurrency(l.total)})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo</label>
                  <select className="input-field" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                    <option value="A">Factura A</option>
                    <option value="B">Factura B</option>
                    <option value="C">Factura C</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Punto de Venta</label>
                  <input className="input-field" value={formData.punto_venta} onChange={e => setFormData({ ...formData, punto_venta: e.target.value })} placeholder="0001" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Número de Factura</label>
                <input className="input-field" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} required placeholder="FC-A-0001-00004561" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Fecha Emisión</label>
                  <input type="date" className="input-field" value={formData.fecha_emision} onChange={e => setFormData({ ...formData, fecha_emision: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Fecha Vencimiento</label>
                  <input type="date" className="input-field" value={formData.fecha_vencimiento} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Monto Neto</label>
                  <input type="number" step="0.01" className="input-field" value={formData.monto_neto} onChange={e => setFormData({ ...formData, monto_neto: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>IVA</label>
                  <input type="number" step="0.01" className="input-field" value={formData.iva} onChange={e => setFormData({ ...formData, iva: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Monto Total</label>
                  <input type="number" step="0.01" className="input-field" value={formData.monto_total} onChange={e => setFormData({ ...formData, monto_total: parseFloat(e.target.value) || 0 })} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Notas</label>
                <textarea className="input-field" rows={2} value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} placeholder="Notas opcionales" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="outline" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" disabled={formLoading}>{formLoading ? 'Guardando...' : 'Crear Factura'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
