import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import API_BASE_URL from '../apiConfig';
import { Plus, ChevronDown, Edit, DollarSign, Package, FileText, Truck as TruckIcon, ArrowRight, CheckCircle2, Clock, Printer, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Trash2, X, Search } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'finalizado': return <span className="badge success">Finalizado</span>;
    case 'en_curso': return <span className="badge info">En curso</span>;
    case 'pendiente': return <span className="badge warning">Pendiente</span>;
    case 'liquidado': return <span className="badge" style={{ backgroundColor: '#8b5cf6', color: '#fff' }}>Liquidado</span>;
    case 'cancelado': return <span className="badge danger">Cancelado</span>;
    default: return <span className="badge">{status}</span>;
  }
};

const getClienteName = (trip) => trip.cliente?.razon_social || '—';
const getChoferName = (trip) => trip.chofer ? `${trip.chofer.nombre} ${trip.chofer.apellido}` : '— Sin asignar —';
const getUnidadLabel = (trip) => trip.unidad ? `${trip.unidad.marca} ${trip.unidad.modelo} (${trip.unidad.patente})` : '—';
const getProveedorName = (trip) => trip.proveedor?.razon_social || null;

// Helpers para tarifa
const UNIDAD_MEDIDA_LABELS = {
  viaje: 'Precio fijo por viaje',
  kg: 'Por kilogramo de carga',
  km: 'Por kilómetro recorrido',
  bulto: 'Por bulto / unidad',
  tonelada: 'Por tonelada de carga',
  por_viaje: 'Precio fijo por viaje',
  por_kg: 'Por kilogramo de carga',
  por_km: 'Por kilómetro recorrido',
  por_bulto: 'Por bulto / unidad',
};

// ============================================================ 
// PRINT COMPONENTS
// ============================================================
const PrintPortal = ({ children }) => {
  const el = useMemo(() => document.createElement('div'), []);
  useEffect(() => {
    el.className = 'print-only';
    document.body.appendChild(el);
    return () => { document.body.removeChild(el); };
  }, [el]);
  return createPortal(children, el);
};

const PrintReceipt = ({ type, item, viaje }) => {
  const isAnticipo = type.toLowerCase().includes('anticipo');
  const color = '#333';
  const displayTitle = isAnticipo ? 'COMPROBANTE DE ANTICIPO' : 'COMPROBANTE DE GASTO';

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <div style={{ border: '2px solid #ccc', padding: '40px 30px 30px', borderRadius: '8px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '12px', color: '#999', fontWeight: 'bold' }}>ORIGINAL</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: color }}>{displayTitle}</h1>
            <p style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 'bold' }}>TAG Logística</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}><strong>Fecha:</strong> {formatDateForInput(item.fecha)}</p>
            <p style={{ margin: '5px 0 0' }}><strong>Viaje Nro:</strong> {viaje.codigo_viaje}</p>
          </div>
        </div>

        <div style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}><strong>Concepto:</strong> {item.concepto || item.tipo}</p>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: color, margin: '15px 0' }}>
            {formatCurrency(item.monto)}
          </div>
          {item.metodo_pago && <p><strong>Método de Pago:</strong> {item.metodo_pago}</p>}
          {item.notas && <p><strong>Observaciones:</strong> {item.notas}</p>}
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Información del Viaje</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
            <p><strong>Chofer:</strong> {getChoferName(viaje)}</p>
            <p><strong>Unidad:</strong> {getUnidadLabel(viaje)}</p>
            <p><strong>Origen:</strong> {viaje.origen}</p>
            <p><strong>Destino:</strong> {viaje.destino}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px' }}>
          <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #999', paddingTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '12px' }}>Firma Autorizada</p>
          </div>
          <div style={{ textAlign: 'center', width: '220px', borderTop: '1px solid #999', paddingTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '12px' }}>Firma Recibí</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrintDocumentVoucher = ({ type, item, viaje }) => {
  const displayTitle = type ? type.toUpperCase() : 'COMPROBANTE';

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <div style={{ border: '2px solid #ccc', padding: '40px 30px 30px', borderRadius: '8px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '12px', color: '#999', fontWeight: 'bold' }}>ORIGINAL</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--bg-primary)' }}>{displayTitle}</h1>
            <p style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 'bold' }}>TAG Logística</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}><strong>Fecha:</strong> {formatDateForInput(item.fecha || item.fecha_emision || item.fecha_cobro)}</p>
            <p style={{ margin: '5px 0 0' }}><strong>Viaje:</strong> {viaje.codigo_viaje}</p>
          </div>
        </div>

        <div style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
          <p><strong>Número:</strong> <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.numero || 'S/N'}</span></p>
          {item.monto_total && <p style={{ fontSize: '20px', marginTop: '10px' }}><strong>Monto Total:</strong> {formatCurrency(item.monto_total)}</p>}
          {item.monto && <p style={{ fontSize: '20px', marginTop: '10px' }}><strong>Monto:</strong> {formatCurrency(item.monto)}</p>}
          {item.banco && <p style={{ marginTop: '10px' }}><strong>Banco:</strong> {item.banco}</p>}
          {item.descripcion && <p style={{ marginTop: '10px' }}><strong>Descripción:</strong> {item.descripcion}</p>}
          {item.beneficiario && <p style={{ marginTop: '10px' }}><strong>Beneficiario:</strong> {item.beneficiario}</p>}
          {item.estado && <p style={{ marginTop: '10px' }}><strong>Estado:</strong> <span className="badge" style={{ textTransform: 'uppercase' }}>{item.estado}</span></p>}
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Información del Viaje</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
            <p><strong>Cliente:</strong> {getClienteName(viaje)}</p>
            <p><strong>Proveedor:</strong> {getProveedorName(viaje) || 'Interno'}</p>
            <p><strong>Ruta:</strong> {viaje.origen} {' → '} {viaje.destino}</p>
            <p><strong>Chofer:</strong> {getChoferName(viaje)}</p>
            <p><strong>Unidad:</strong> {getUnidadLabel(viaje)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================ 
// SUB-FORM COMPONENTS
// ============================================================

const SubFormModal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
    <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const ViewDocument = ({ item, type }) => {
  const fields = [];
  if (type === 'gasto' || type === 'anticipo') {
    fields.push({ label: 'Concepto', value: item.concepto });
    fields.push({ label: 'Monto', value: formatCurrency(item.monto) });
    fields.push({ label: 'Fecha', value: formatDateForInput(item.fecha) });
    if (item.tipo) fields.push({ label: 'Categoría', value: item.tipo });
    if (item.metodo_pago) fields.push({ label: 'Método Pago', value: item.metodo_pago });
    if (item.notas) fields.push({ label: 'Notas', value: item.notas });
  } else if (type === 'documento') {
    fields.push({ label: 'Tipo', value: item.tipo });
    fields.push({ label: 'Número', value: item.numero });
    fields.push({ label: 'Fecha', value: formatDateForInput(item.fecha) });
  }

  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      {fields.map((f, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{f.label}</div>
          <div style={{ fontWeight: 500 }}>{f.value || '—'}</div>
        </div>
      ))}
    </div>
  );
};

const FinanceForm = ({ item, viajetoId, onSave, onClose }) => {
  const [type, setType] = useState(item ? (item.metodo_pago ? 'anticipo' : 'gasto') : 'gasto');
  const [formData, setFormData] = useState(item ? {
    ...item,
    fecha: formatDateForInput(item.fecha)
  } : {
    viaje_id: viajetoId,
    tipo: 'Combustible', // para gasto
    concepto: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'Efectivo', // para anticipo
    notas: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = type === 'gasto' ? 'gastos' : 'anticipos';
      const url = item ? `${API_BASE_URL}/${endpoint}/${item.id}` : `${API_BASE_URL}/${endpoint}`;
      const method = item ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ...formData, viaje_id: viajetoId })
      });

      if (res.ok) onSave();
      else alert('Error al guardar item financiero');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Tipo de Movimiento</label>
        <select className="input-field" value={type} onChange={e => setType(e.target.value)} disabled={!!item}>
          <option value="gasto">Gasto</option>
          <option value="anticipo">Anticipo</option>
        </select>
      </div>

      {type === 'gasto' && (
        <div>
          <label style={labelStyle}>Categoría</label>
          <select className="input-field" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
            <option>Combustible</option>
            <option>Peaje</option>
            <option>Mantenimiento</option>
            <option>Viáticos</option>
            <option>Seguro</option>
            <option>Otros</option>
          </select>
        </div>
      )}

      <div>
        <label style={labelStyle}>Concepto</label>
        <input className="input-field" value={formData.concepto} onChange={e => setFormData({ ...formData, concepto: e.target.value })} required placeholder="Ej. Pago Combustible YPF" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Monto</label>
          <input type="number" className="input-field" value={formData.monto} onChange={e => setFormData({ ...formData, monto: e.target.value })} required />
        </div>
        <div>
          <label style={labelStyle}>Fecha</label>
          <input type="date" className="input-field" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required />
        </div>
      </div>

      {type === 'anticipo' && (
        <div>
          <label style={labelStyle}>Método de Pago</label>
          <select className="input-field" value={formData.metodo_pago} onChange={e => setFormData({ ...formData, metodo_pago: e.target.value })}>
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Cheque</option>
          </select>
        </div>
      )}

      <div>
        <label style={labelStyle}>Notas / Observaciones</label>
        <textarea className="input-field" value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} rows={2} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" className="outline" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : `Guardar ${type === 'gasto' ? 'Gasto' : 'Anticipo'}`}</button>
      </div>
    </form>
  );
};

const DocumentationForm = ({ trip, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const existingDoc = trip.documento;

  const [docData, setDocData] = useState({
    viaje_id: trip.id,
    tipo: existingDoc?.tipo || 'REMITO',
    numero: existingDoc?.numero || '',
    fecha: existingDoc?.fecha ? formatDateForInput(existingDoc.fecha) : new Date().toISOString().split('T')[0],
    descripcion: existingDoc?.descripcion || '',
    estado: existingDoc?.estado || 'pendiente',
    notas: existingDoc?.notas || '',
  });

  const isEdit = !!existingDoc;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit
        ? `${API_BASE_URL}/documentos/${existingDoc.id}`
        : `${API_BASE_URL}/documentos`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(docData),
      });

      if (res.ok) onSave();
      else {
        const err = await res.json();
        alert('Error al guardar: ' + JSON.stringify(err.errors || err.message));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Tipo de Documento</label>
        <select className="input-field" value={docData.tipo} onChange={e => setDocData({ ...docData, tipo: e.target.value })}>
          <option value="REMITO">Remito</option>
          <option value="CARTA_DE_PORTE">Carta de Porte</option>
          <option value="HOJA_DE_RUTA">Hoja de Ruta</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Número de Documento</label>
        <input className="input-field" value={docData.numero} onChange={e => setDocData({ ...docData, numero: e.target.value })} required placeholder="Nro. del documento (alfanumérico)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Fecha</label>
          <input type="date" className="input-field" value={docData.fecha} onChange={e => setDocData({ ...docData, fecha: e.target.value })} required />
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select className="input-field" value={docData.estado} onChange={e => setDocData({ ...docData, estado: e.target.value })}>
            <option value="pendiente">Pendiente</option>
            <option value="conforme">Conforme</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Descripción</label>
        <input className="input-field" value={docData.descripcion} onChange={e => setDocData({ ...docData, descripcion: e.target.value })} placeholder="Descripción opcional" />
      </div>
      <div>
        <label style={labelStyle}>Notas</label>
        <textarea className="input-field" rows={2} value={docData.notas} onChange={e => setDocData({ ...docData, notas: e.target.value })} placeholder="Notas adicionales" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" className="outline" onClick={onClose}>Cancelar</button>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : (isEdit ? 'Actualizar Documento' : 'Cargar Documento')}</button>
      </div>
    </form>
  );
};

const PrintSelectedTable = ({ viajes }) => (
  <div style={{ padding: '0', fontFamily: 'sans-serif', color: 'black' }}>
    <style>{`@page { size: A4 landscape; margin: 10mm; }`}</style>
    <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>TAG Logística</h1>
        <h3 style={{ margin: '0.2rem 0 0 0', color: '#555', fontSize: '1rem' }}>Reporte General de Viajes</h3>
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
        <p style={{ margin: 0 }}>Fecha de Emisión: {new Date().toLocaleDateString('es-AR')}</p>
        <p style={{ margin: 0 }}>Total Registros: {viajes.length}</p>
      </div>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Código</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Fechas (S / L)</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Proveedor</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Ruta (Km)</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Estado</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Asignación a Cargo</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Info de Carga</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'right' }}>Tarifa / Precio</th>
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        {viajes.sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida)).map(trip => (
          <tr key={trip.id}>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem', whiteSpace: 'nowrap' }}><strong>{trip.codigo_viaje}</strong></td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
              Sal: {trip.fecha_salida ? trip.fecha_salida.split('T')[0] : 'S/D'} {trip.hora_salida ? trip.hora_salida.substring(11, 16) : ''}<br />
              Lle: {trip.fecha_llegada ? trip.fecha_llegada.split('T')[0] : 'S/D'} {trip.hora_llegada ? trip.hora_llegada.substring(11, 16) : ''}
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{getProveedorName(trip)}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{trip.origen} {' → '} {trip.destino}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{trip.estado.toUpperCase()}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
              {trip.proveedor_id ? `[Tercerizado] ${getProveedorName(trip)}` : `[Propio] Chofer: ${getChoferName(trip)}`}
              {!trip.proveedor_id && <><br /><span style={{ color: '#555', fontSize: '0.65rem' }}>{getUnidadLabel(trip)}</span></>}
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
              {trip.carga?.tipo_carga || 'General'}
              <span style={{ display: 'block', color: '#555', fontSize: '0.65rem' }}>
                P: {trip.carga?.peso_kg ? `${trip.carga.peso_kg}kg` : 'S/D'} | B: {trip.carga?.cantidad_bultos || 'S/D'}
              </span>
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{formatCurrency(trip.precio_pactado)}</div>
              <div style={{ fontSize: '0.6rem', color: '#666' }}>{trip.tarifa_base} x {formatCurrency(trip.tarifa_valor)}</div>
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem', maxWidth: '200px', wordWrap: 'break-word' }}>{trip.observaciones || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PrintTripSheet = ({ viaje }) => (
  <div style={{ padding: '0', fontFamily: 'sans-serif', color: 'black', minHeight: '100vh' }}>
    <style>{`@page { size: A4 portrait; margin: 15mm; }`}</style>
    <div style={{ border: '2px solid black', padding: '2rem', borderRadius: '8px' }}>
      <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase' }}>TAG Logística</h1>
          <h2 style={{ margin: '0.2rem 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Hoja de Ruta / Viaje</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Nº {viaje.codigo_viaje}</h2>
          <p style={{ margin: 0, textTransform: 'uppercase', fontWeight: 'bold' }}>{viaje.estado}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Logística</h3>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Origen:</strong> {viaje.origen}</p>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Destino:</strong> {viaje.destino}</p>
          <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>Fecha Salida:</strong> {viaje.fecha_salida ? viaje.fecha_salida.split('T')[0] : 'S/D'} {viaje.hora_salida ? viaje.hora_salida.substring(11, 16) : ''}</p>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Fecha Llegada:</strong> {viaje.fecha_llegada ? viaje.fecha_llegada.split('T')[0] : 'S/D'} {viaje.hora_llegada ? viaje.hora_llegada.substring(11, 16) : ''}</p>
        </div>
        <div>
          <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Asignación</h3>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Cliente:</strong> {getClienteName(viaje)}</p>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Transporte:</strong> {getProveedorName(viaje) || 'Flota Propia'}</p>
          <p style={{ margin: '0.5rem 0 0.3rem 0' }}><strong>Unidad Asignada:</strong> {getUnidadLabel(viaje)}</p>
          <p style={{ margin: '0 0 0.3rem 0' }}><strong>Chofer:</strong> {getChoferName(viaje)}</p>
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Detalles de Carga y Tarifa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <p style={{ margin: 0 }}><strong>Tipo:</strong> {viaje.carga?.tipo_carga || 'General'}</p>
        <p style={{ margin: 0 }}><strong>Peso:</strong> {viaje.carga?.peso_kg ? `${viaje.carga.peso_kg} Kg` : '—'}</p>
        <p style={{ margin: 0 }}><strong>Bultos:</strong> {viaje.carga?.cantidad_bultos || '—'}</p>
        <p style={{ margin: 0 }}><strong>Refrigeración:</strong> {viaje.carga?.requiere_refrigeracion ? 'SÍ' : 'NO'}</p>
      </div>
      <div style={{ backgroundColor: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0 }}><strong>Esquema de Tarifa:</strong> {UNIDAD_MEDIDA_LABELS[viaje.tipo_tarifa] || 'Tarifa pactada'}</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
          <strong>Valor:</strong> {formatCurrency(viaje.tarifa_valor)} x {viaje.tarifa_base} = <span style={{ fontWeight: 'bold' }}>{formatCurrency(viaje.precio_pactado)}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Gastos de Viaje</h4>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '0.2rem' }}>Concepto</th>
                <th style={{ textAlign: 'right', padding: '0.2rem' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {viaje.gastos?.length > 0 ? viaje.gastos.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.2rem' }}>{g.concepto || g.tipo}</td>
                  <td style={{ padding: '0.2rem', textAlign: 'right' }}>{formatCurrency(g.monto)}</td>
                </tr>
              )) : <tr><td colSpan="2" style={{ color: '#999', padding: '0.2rem' }}>Sin gastos registrados</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h4 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Anticipos Entregados</h4>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '0.2rem' }}>Concepto</th>
                <th style={{ textAlign: 'right', padding: '0.2rem' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {viaje.anticipos?.length > 0 ? viaje.anticipos.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.2rem' }}>{a.concepto || a.metodo_pago}</td>
                  <td style={{ padding: '0.2rem', textAlign: 'right' }}>{formatCurrency(a.monto)}</td>
                </tr>
              )) : <tr><td colSpan="2" style={{ color: '#999', padding: '0.2rem' }}>Sin anticipos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '0.5rem' }}>Observaciones e Instrucciones</h3>
      <p style={{ minHeight: '40px', fontSize: '0.9rem' }}>{viaje.observaciones || 'Sin indicaciones especiales.'}</p>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-around', paddingTop: '1rem' }}>
        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderTop: '1px solid black', paddingTop: '0.5rem' }}>Firma Chofer / Encargado</div>
        </div>
        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderTop: '1px solid black', paddingTop: '0.5rem' }}>Sello Operaciones / TAG</div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================ 
// CUSTOM MODALS
// ============================================================
const AlertModal = ({ message, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
    <div className="card" style={{ maxWidth: '400px', width: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-danger-text)' }}>Atención</h3>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button onClick={onClose}>Aceptar</button>
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
    <div className="card" style={{ maxWidth: '400px', width: '90%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Confirmar Acción</h3>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
        <button className="outline" onClick={onClose}>Cancelar</button>
        <button className="danger" onClick={() => { onConfirm(); onClose(); }}>Confirmar</button>
      </div>
    </div>
  </div>
);

// ============================================================ 
// FORM MODAL (Create / Edit)
// ============================================================
const TripFormModal = ({ trip, onClose, onSave, clientes, unidades, choferes, proveedores }) => {
  const isEdit = !!trip;
  const title = isEdit ? `Editar Viaje #${trip.id}` : 'Cargar Nuevo Viaje';
  const d = trip || {};

  const [esTercerizado, setEsTercerizado] = useState(!!d.proveedor_id);
  const [clienteId, setClienteId] = useState(d.cliente_id || '');
  const [proveedorId, setProveedorId] = useState(d.proveedor_id || '');
  const [unidadId, setUnidadId] = useState(d.unidad_id || '');
  const [choferId, setChoferId] = useState(d.chofer_id || '');

  const dateSalida = d.fecha_salida ? d.fecha_salida.split('T')[0] : '';
  const timeSalida = d.hora_salida ? d.hora_salida.substring(11, 16) : '';
  const dateLlegada = d.fecha_llegada ? d.fecha_llegada.split('T')[0] : '';
  const timeLlegada = d.hora_llegada ? d.hora_llegada.substring(11, 16) : '';

  const [precioPactado, setPrecioPactado] = useState(d.precio_pactado || '');
  const [costoProveedor, setCostoProveedor] = useState(d.costo_proveedor || '');

  const [pesoKg, setPesoKg] = useState(d.carga?.peso_kg || '');
  const [bultos, setBultos] = useState(d.carga?.cantidad_bultos || '');
  const [kmRecorrido, setKmRecorrido] = useState(d.km_recorrido || '');

  // Tariff System
  const [tipoTarifa, setTipoTarifa] = useState(d.tipo_tarifa || 'fija');
  const [tarifaValor, setTarifaValor] = useState(d.tarifa_valor || '');
  const [tarifaBase, setTarifaBase] = useState(d.tarifa_base || (d.tipo_tarifa === 'fija' ? '1.00' : ''));

  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmCfg, setConfirmCfg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-calculation logic
  useEffect(() => {
    if (tipoTarifa === 'fija') setTarifaBase('1.00');
    else if (tipoTarifa === 'tonelada') setTarifaBase(pesoKg > 0 ? (pesoKg / 1000).toFixed(2) : '');
    else if (tipoTarifa === 'bulto') setTarifaBase(bultos || '');
    else if (tipoTarifa === 'km') setTarifaBase(kmRecorrido || '');
  }, [tipoTarifa, pesoKg, bultos, kmRecorrido]);

  useEffect(() => {
    if (tarifaValor && tarifaBase) {
      const calc = (Number(tarifaValor) * Number(tarifaBase)).toFixed(2);
      setPrecioPactado(calc);
    }
  }, [tarifaValor, tarifaBase]);

  // Filter Assets
  const filteredUnidades = unidades.filter(u => {
    if (esTercerizado) return u.proveedor_id === Number(proveedorId);
    return !u.proveedor_id;
  });

  const filteredChoferes = choferes.filter(c => {
    if (esTercerizado) return c.proveedor_id === Number(proveedorId);
    return !c.proveedor_id;
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: '2rem 0',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '720px', margin: '0 1rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{title}</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={(e) => { e.preventDefault(); onClose(); }}>

          {/* — Sección: Datos Principales — */}
          <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-muted)' }}>Datos del Viaje</legend>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Cliente *</label>
                <select className="input-field" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.5rem' }}>
                <input type="checkbox" id="tercerizado" checked={esTercerizado} onChange={e => {
                  setEsTercerizado(e.target.checked);
                  if (!e.target.checked) setProveedorId('');
                  setUnidadId('');
                  setChoferId('');
                }} />
                <label htmlFor="tercerizado" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tercerizado</label>
              </div>

              <div style={{ flex: '1 1 200px', opacity: esTercerizado ? 1 : 0.6 }}>
                <label style={labelStyle}>Proveedor (Empresa) *</label>
                <select
                  className="input-field"
                  value={proveedorId}
                  onChange={e => { setProveedorId(e.target.value); setUnidadId(''); setChoferId(''); }}
                  required={esTercerizado}
                  disabled={!esTercerizado}
                >
                  <option value="">{esTercerizado ? 'Seleccione proveedor...' : '— Propio —'}</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Unidad *</label>
                <select className="input-field" value={unidadId} onChange={e => setUnidadId(e.target.value)} required>
                  <option value="">Seleccione unidad...</option>
                  {filteredUnidades.map(u => <option key={u.id} value={u.id}>{u.marca} {u.modelo} ({u.patente})</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Chofer *</label>
                <select className="input-field" value={choferId} onChange={e => setChoferId(e.target.value)} required>
                  <option value="">Seleccione chofer...</option>
                  {filteredChoferes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {/* — Sección: Ruta y Horarios — */}
          <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-muted)' }}>Ruta y Horarios</legend>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Origen *</label>
                <input id="f_origen" type="text" className="input-field" placeholder="Ej. CABA" defaultValue={d.origen || ''} required />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Fecha Salida</label>
                <input id="f_f_salida" type="date" className="input-field" defaultValue={dateSalida} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>Hora Salida</label>
                <input id="f_h_salida" type="time" className="input-field" defaultValue={timeSalida} />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Destino *</label>
                <input id="f_destino" type="text" className="input-field" placeholder="Ej. Rosario" defaultValue={d.destino || ''} required />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Fecha Llegada</label>
                <input id="f_f_llegada" type="date" className="input-field" defaultValue={dateLlegada} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>Hora Llegada</label>
                <input id="f_h_llegada" type="time" className="input-field" defaultValue={timeLlegada} />
              </div>

              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Distancia (km)</label>
                <input id="f_km" type="number" className="input-field" placeholder="0" value={kmRecorrido} onChange={e => setKmRecorrido(e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* — Sección: Carga — */}
          <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-muted)' }}>Datos de Carga</legend>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Descripción</label>
                <input id="f_carga_desc" type="text" className="input-field" placeholder="Ej. Electrodomésticos" defaultValue={d.carga?.descripcion || ''} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Tipo de Carga</label>
                <select id="f_tipo_carga" className="input-field" defaultValue={d.carga?.tipo_carga || ''}>
                  <option value="">Seleccione...</option>
                  <option>General</option>
                  <option>Granel</option>
                  <option>Pesada</option>
                  <option>Refrigerada</option>
                  <option>Peligrosa</option>
                </select>
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Peso (kg)</label>
                <input type="number" className="input-field" placeholder="0" value={pesoKg} onChange={e => setPesoKg(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Bultos</label>
                <input type="number" className="input-field" placeholder="0" value={bultos} onChange={e => setBultos(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.25rem' }}>
                <input type="checkbox" id="refri" defaultChecked={d.carga?.requiere_refrigeracion || false} />
                <label htmlFor="refri" style={{ fontSize: '0.875rem' }}>Refrigeración</label>
              </div>
            </div>
          </fieldset>

          {/* — Sección: Precio y Estado — */}
          <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-muted)' }}>Precio y Estado</legend>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Tipo de Tarifa</label>
                <select
                  className="input-field"
                  value={tipoTarifa}
                  onChange={e => setTipoTarifa(e.target.value)}
                >
                  <option value="fija">Fija por viaje</option>
                  <option value="tonelada">Por tonelada</option>
                  <option value="bulto">Por bulto</option>
                  <option value="km">Por km recorrido</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Tarifa Unitario ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="0.00"
                    value={tarifaValor}
                    onChange={e => setTarifaValor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  {tipoTarifa === 'fija' ? 'Base (Fija)' :
                    tipoTarifa === 'tonelada' ? 'Cantidad (Toneladas)' :
                      tipoTarifa === 'bulto' ? 'Cantidad (Bultos)' : 'Cantidad (Kilómetros)'}
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={tarifaBase}
                  onChange={e => setTarifaBase(e.target.value)}
                  disabled={tipoTarifa === 'fija'}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Precio Pactado (Cálculo Final) *</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    style={{ paddingLeft: '2.25rem', backgroundColor: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}
                    value={precioPactado}
                    onChange={e => setPrecioPactado(e.target.value)}
                    required
                  />
                </div>
              </div>

              {esTercerizado && (
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Costo Proveedor *</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0.00"
                      style={{ paddingLeft: '2.25rem' }}
                      value={costoProveedor}
                      onChange={e => setCostoProveedor(e.target.value)}
                      required={esTercerizado}
                    />
                  </div>
                </div>
              )}

              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Estado</label>
                <select id="f_estado" className="input-field" defaultValue={d.estado || 'pendiente'}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea id="f_obs" className="input-field" rows="2" placeholder="Notas internas sobre el viaje..." defaultValue={d.observaciones || ''} style={{ resize: 'vertical' }} />
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              {isEdit && !d.deleted_at && (
                <button
                  type="button"
                  className="outline"
                  style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => {
                    setConfirmCfg({
                      message: '¿Seguro que deseas archivar este viaje? Ya no aparecerá en el listado activo.',
                      action: async () => {
                        await fetch(`${API_BASE_URL}/viajes/${d.id}`, { method: 'DELETE' });
                        onSave();
                        onClose();
                      }
                    });
                  }}
                >
                  <Trash2 size={16} /> Archivar Viaje
                </button>
              )}
              {isEdit && !!d.deleted_at && (
                <button
                  type="button"
                  className="outline"
                  style={{ color: 'var(--color-success-text)', borderColor: 'var(--color-success-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={async () => {
                    await fetch(`${API_BASE_URL}/viajes/${d.id}/restore`, { method: 'POST' });
                    onSave();
                    onClose();
                  }}
                >
                  <RefreshCw size={16} /> Restaurar Viaje
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="outline" onClick={onClose}>Cancelar</button>
              {!d.deleted_at && <button type="button" disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }} onClick={async () => {
                if (isSaving) return;
                setIsSaving(true);
                const payload = {
                  cliente_id: clienteId,
                  proveedor_id: esTercerizado ? (proveedorId || null) : null,
                  unidad_id: unidadId || null,
                  chofer_id: choferId || null,
                  origen: document.getElementById('f_origen').value,
                  destino: document.getElementById('f_destino').value,
                  precio_pactado: precioPactado || 0,
                  costo_proveedor: esTercerizado ? (costoProveedor || 0) : 0,
                  km_recorrido: kmRecorrido || 0,
                  tipo_tarifa: tipoTarifa,
                  tarifa_valor: tarifaValor || 0,
                  tarifa_base: tarifaBase || 0,
                  fecha_salida: document.getElementById('f_f_salida').value || null,
                  hora_salida: document.getElementById('f_h_salida').value || null,
                  fecha_llegada: document.getElementById('f_f_llegada').value || null,
                  hora_llegada: document.getElementById('f_h_llegada').value || null,
                  observaciones: document.getElementById('f_obs').value,
                  estado: document.getElementById('f_estado').value,
                  carga: {
                    descripcion: document.getElementById('f_carga_desc').value,
                    tipo_carga: document.getElementById('f_tipo_carga').value,
                    peso_kg: pesoKg || 0,
                    cantidad_bultos: bultos || 0,
                    requiere_refrigeracion: document.getElementById('refri').checked
                  }
                };
                try {
                  const isUpdate = d.id !== undefined;
                  const url = isUpdate ? `${API_BASE_URL}/viajes/${d.id}` : `${API_BASE_URL}/viajes`;
                  const res = await fetch(url, {
                    method: isUpdate ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (res.ok) {
                    const newTrip = await res.json();
                    if (onSave) onSave(newTrip);
                    onClose();
                  } else {
                    const err = await res.json();
                    setAlertMsg('Error al guardar: ' + JSON.stringify(err.errors || err.message));
                  }
                } catch (e) {
                  setAlertMsg('Error de red al conectar al API');
                } finally {
                  setIsSaving(false);
                }
              }}>{isSaving ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                  Guardando...
                </div>
              ) : (isEdit ? 'Guardar Cambios' : 'Crear Viaje')}</button>}
            </div>
          </div>
        </form>
      </div>

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
      {confirmCfg && <ConfirmModal message={confirmCfg.message} onConfirm={confirmCfg.action} onClose={() => setConfirmCfg(null)} />}
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' };

// ============================================================ 
// EXPANDED ROW DETAIL (TABBED)
// ============================================================
const TripDetail = ({ trip, onRefresh, onPrint, setConfirmCfg, setAlertMsg }) => {
  // Tab persistence using localStorage
  const storageKey = `activeTab_${trip.id}`;
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(storageKey) || 'resumen');

  useEffect(() => {
    localStorage.setItem(storageKey, activeTab);
  }, [activeTab, storageKey]);

  const [modalCfg, setModalCfg] = useState(null); // { type: 'finance'|'documentation'|'view', item: null|object }

  const totalGastos = trip.gastos?.reduce((a, g) => a + parseFloat(g.monto), 0) || 0;
  const totalAnticipos = trip.anticipos?.reduce((a, an) => a + parseFloat(an.monto), 0) || 0;
  const margen = parseFloat(trip.precio_pactado) || 0; // Gastos and anticipos don't affect margin for now

  const handleDelete = (endpoint, id) => {
    setConfirmCfg({
      message: '¿Estás seguro de que deseas eliminar este registro?',
      action: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) onRefresh();
          else setAlertMsg('Error al eliminar');
        } catch (e) { console.error(e); }
      }
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      {/* Detail Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
        <button
          className={activeTab === 'resumen' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('resumen')}
          style={tabButtonStyle(activeTab === 'resumen')}
        >
          <TruckIcon size={14} /> Resumen Logístico
        </button>
        <button
          className={activeTab === 'finanzas' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('finanzas')}
          style={tabButtonStyle(activeTab === 'finanzas')}
        >
          <DollarSign size={14} /> Finanzas
        </button>
        <button
          className={activeTab === 'documentacion' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('documentacion')}
          style={tabButtonStyle(activeTab === 'documentacion')}
        >
          <FileText size={14} /> Documentación
        </button>
      </div>

      <div style={{ padding: '1.5rem' }}>

        {/* TAB 1: RESUMEN */}
        {activeTab === 'resumen' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={subHeaderStyle}><TruckIcon size={14} />Logística</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <InfoLine label="Cliente" value={getClienteName(trip)} />
                <InfoLine label="Transporte" value={getProveedorName(trip) || 'Flota Propia'} />
                <InfoLine label="Chofer" value={getChoferName(trip)} />
                <InfoLine label="Unidad" value={getUnidadLabel(trip)} />
                <InfoLine label="Salida" value={trip.fecha_salida ? `${trip.fecha_salida.split('T')[0]} ${trip.hora_salida ? trip.hora_salida.substring(11, 16) : ''}` : '—'} />
                <InfoLine label="Origen" value={trip.origen} />
                <InfoLine label="Destino" value={trip.destino} />
              </div>
              {trip.observaciones && <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                <strong>Observaciones:</strong> {trip.observaciones}
              </div>}
            </div>

            <div style={{ flex: '1 1 250px' }}>
              <h4 style={subHeaderStyle}><Package size={14} />Detalles de Carga</h4>
              {trip.carga ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <InfoLine label="Descripción" value={trip.carga.descripcion} />
                  <InfoLine label="Tipo" value={trip.carga.tipo_carga} />
                  <InfoLine label="Peso Bruto" value={trip.carga.peso_kg ? `${trip.carga.peso_kg.toLocaleString()} kg` : '—'} />
                  {trip.carga.cantidad_bultos && <InfoLine label="Bultos" value={trip.carga.cantidad_bultos} />}

                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>TARIFA ACORDADA</div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>{UNIDAD_MEDIDA_LABELS[trip.tipo_tarifa] || 'Tarifa'}:</strong> {formatCurrency(trip.tarifa_valor)} x {trip.tarifa_base}
                    </div>
                  </div>

                  {trip.carga.requiere_refrigeracion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontWeight: 500, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9' }}></div> Frío Requerido
                    </div>
                  )}
                </div>
              ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga sin especificar.</p>}
            </div>
          </div>
        )}

        {/* TAB 2: FINANZAS */}
        {activeTab === 'finanzas' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ ...subHeaderStyle, marginBottom: 0 }}><DollarSign size={14} />Desglose de Gastos y Anticipos</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setModalCfg({ type: 'finance', item: null })}>+ Cargar Movimiento</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.5rem 0' }}>Concepto</th>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.gastos?.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.65rem 0' }}>
                          <span className="badge" style={{ backgroundColor: 'var(--bg-body)', fontSize: '0.65rem', marginRight: '0.5rem' }}>{g.tipo}</span>
                          {g.concepto}
                        </td>
                        <td>{formatDateForInput(g.fecha)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-danger-text)' }}>{formatCurrency(g.monto)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none' }} onClick={() => setModalCfg({ type: 'finance', item: g })} title="Editar"><Edit size={14} /></button>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none' }} onClick={() => onPrint('receipt', 'GASTO', g, trip)} title="Imprimir"><Printer size={14} /></button>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => handleDelete('gastos', g.id)} title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {trip.anticipos?.map(an => (
                      <tr key={`an-${an.id}`} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                        <td style={{ padding: '0.65rem 0' }}>
                          <span className="badge success" style={{ fontSize: '0.65rem', marginRight: '0.5rem' }}>Anticipo</span>
                          {an.concepto}
                        </td>
                        <td>{formatDateForInput(an.fecha)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-success-text)' }}>{formatCurrency(an.monto)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none' }} onClick={() => setModalCfg({ type: 'finance', item: an })} title="Editar"><Edit size={14} /></button>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none' }} onClick={() => onPrint('receipt', 'ANTICIPO', an, trip)} title="Imprimir"><Printer size={14} /></button>
                            <button className="outline" style={{ padding: '0.2rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => handleDelete('anticipos', an.id)} title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!trip.gastos?.length && !trip.anticipos?.length) && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin registros financieros.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <div style={{ backgroundColor: 'var(--bg-body)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Precio Acordado</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bg-primary)' }}>{formatCurrency(trip.precio_pactado)}</div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Gastos Registrados</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-danger-text)' }}>{formatCurrency(totalGastos)}</div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Anticipos Registrados</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-success-text)' }}>{formatCurrency(totalAnticipos)}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTACION */}
        {activeTab === 'documentacion' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ ...subHeaderStyle, marginBottom: 0 }}><FileText size={14} />Documento del Viaje</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!trip.documento && (
                  <button style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setModalCfg({ type: 'documentation', item: null })}>+ Cargar Documento</button>
                )}
                {trip.documento && (
                  <button style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => setModalCfg({ type: 'documentation', item: trip.documento })}>Editar Documento</button>
                )}
              </div>
            </div>

            {trip.documento ? (
              <div style={{ ...chainContainerStyle, justifyContent: 'center' }}>
                <div style={{ ...stepStyle, opacity: 1, minWidth: '250px' }}>
                  <div style={stepTitleStyle}>
                    <FileText size={14} />
                    {trip.documento.tipo === 'REMITO' ? 'Remito' : trip.documento.tipo === 'CARTA_DE_PORTE' ? 'Carta de Porte' : 'Hoja de Ruta'}
                  </div>
                  <div style={stepContentStyle}>
                    <strong style={{ fontSize: '1rem' }}>{trip.documento.numero}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, margin: '0.25rem 0' }}>{formatDateForInput(trip.documento.fecha)}</span>
                    {trip.documento.descripcion && (
                      <span style={{ display: 'block', fontSize: '0.8rem', margin: '0.25rem 0' }}>{trip.documento.descripcion}</span>
                    )}
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span className={`badge ${trip.documento.estado === 'conforme' ? 'success' : (trip.documento.estado === 'pendiente' ? 'warning' : 'danger')}`} style={{ fontSize: '0.65rem' }}>
                        {trip.documento.estado}
                      </span>
                      <button className="outline" style={{ padding: '0.1rem', border: 'none' }} onClick={() => onPrint('document', trip.documento.tipo, trip.documento, trip)} title="Imprimir"><Printer size={12} /></button>
                      <button className="outline" style={{ padding: '0.1rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => handleDelete('documentos', trip.documento.id)} title="Eliminar"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                <p>Sin documento asignado. Cargue un Remito, Carta de Porte u Hoja de Ruta.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-form Modals */}
      {modalCfg?.type === 'view' && (
        <SubFormModal title={`Detalles de ${modalCfg.subType.replace('-', ' ')}`} onClose={() => setModalCfg(null)}>
          <ViewDocument item={modalCfg.item} type={modalCfg.subType} />
        </SubFormModal>
      )}
      {modalCfg?.type === 'finance' && (
        <SubFormModal title={modalCfg.item ? 'Editar Movimiento' : 'Nuevo Movimiento'} onClose={() => setModalCfg(null)}>
          <FinanceForm viajetoId={trip.id} item={modalCfg.item} onSave={() => { setModalCfg(null); onRefresh(); }} onClose={() => setModalCfg(null)} />
        </SubFormModal>
      )}
      {modalCfg?.type === 'documentation' && (
        <SubFormModal title="Cargar Documentación" onClose={() => setModalCfg(null)}>
          <DocumentationForm trip={trip} onSave={() => { setModalCfg(null); onRefresh(); }} onClose={() => setModalCfg(null)} />
        </SubFormModal>
      )}
    </div>
  );
};


// Styles for Tabs
const tabButtonStyle = (isActive) => ({
  flex: 1,
  padding: '1rem',
  border: 'none',
  borderBottom: isActive ? '3px solid var(--bg-primary)' : '3px solid transparent',
  backgroundColor: isActive ? 'rgba(var(--bg-primary-rgb), 0.05)' : 'transparent',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  outline: 'none',
});

const subHeaderStyle = { marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' };

const chainContainerStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-body)' };
const stepStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const stepTitleStyle = { fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' };
const stepContentStyle = { display: 'flex', flexDirection: 'column', gap: '0.1rem', minHeight: '40px', justifyContent: 'center' };
const arrowStyle = { color: 'var(--border-color)', margin: '0 0.25rem' };

const InfoLine = ({ label, value }) => (
  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
    <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>{label}:</span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

// ============================================================ 
// MAIN COMPONENT
// ============================================================
const Trips = () => {
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [formTrip, setFormTrip] = useState(undefined); // undefined = closed, null = new, object = edit
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [verArchivados, setVerArchivados] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState([]);

  const [printMode, setPrintMode] = useState(null);
  const [tripToPrint, setTripToPrint] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const [printSubType, setPrintSubType] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmCfg, setConfirmCfg] = useState(null);

  useEffect(() => {
    if (printMode) {
      const t = setTimeout(() => {
        window.print();
      }, 300);

      const handleAfterPrint = () => {
        setPrintMode(null);
        setTripToPrint(null);
      };

      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        clearTimeout(t);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [printMode]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedTrips(viajes.map(v => v.id));
    else setSelectedTrips([]);
  };

  const toggleTripSelection = (id) => {
    if (selectedTrips.includes(id)) setSelectedTrips(selectedTrips.filter(tId => tId !== id));
    else setSelectedTrips([...selectedTrips, id]);
  };

  const fetchViajes = async (page = currentPage, forceSortBy = sortBy, forceSortDir = sortDir) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/viajes?page=${page}`;
      if (verArchivados) url += '&archivados=1';
      if (forceSortBy && forceSortDir) {
        url += `&sort_by=${forceSortBy}&sort_dir=${forceSortDir}`;
      }
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (fechaDesde) url += `&fecha_desde=${fechaDesde}`;
      if (fechaHasta) url += `&fecha_hasta=${fechaHasta}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setViajes(json.data || []);
        setCurrentPage(json.current_page || 1);
        setTotalPages(json.last_page || 1);
        setTotalRecords(json.total || 0);
      }
    } catch (e) {
      console.error("Error fetching viajes:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [cliRes, uniRes, choRes, provRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clientes`),
        fetch(`${API_BASE_URL}/unidades`),
        fetch(`${API_BASE_URL}/choferes`),
        fetch(`${API_BASE_URL}/proveedores`)
      ]);
      if (cliRes.ok) setClientes(await cliRes.json());
      if (uniRes.ok) setUnidades(await uniRes.json());
      if (choRes.ok) setChoferes(await choRes.json());
      if (provRes.ok) setProveedores(await provRes.json());
    } catch (e) {
      console.error("Error fetching options:", e);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
    fetchViajes(1, sortBy, sortDir);
  }, [verArchivados, fechaDesde, fechaHasta]);

  // Debounce para búsqueda
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchViajes(1, sortBy, sortDir);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  React.useEffect(() => {
    fetchOptions();
  }, []);

  const handleSort = (column) => {
    let newSortBy = column;
    let newSortDir = null;

    if (column === 'estado') {
      const estados = ['pendiente', 'en_curso', 'finalizado', 'cancelado', null];
      if (sortBy === 'estado' && sortDir) {
        const currentIndex = estados.indexOf(sortDir);
        newSortDir = estados[currentIndex + 1] || null;
      } else {
        newSortDir = 'pendiente';
      }
      if (!newSortDir) newSortBy = null;
    } else {
      if (sortBy === column) {
        if (sortDir === 'asc') newSortDir = 'desc';
        else if (sortDir === 'desc') { newSortBy = null; newSortDir = null; }
        else newSortDir = 'asc';
      } else {
        newSortDir = 'asc';
      }
    }

    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setCurrentPage(1);
    fetchViajes(1, newSortBy, newSortDir);
  };

  const SortableHeader = ({ title, column, style }) => {
    const isActive = sortBy === column;
    return (
      <th onClick={() => handleSort(column)} style={{ cursor: 'pointer', userSelect: 'none', ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: style?.textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
          {title}
          {isActive && column !== 'estado' && (
            sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
          )}
          {isActive && column === 'estado' && (
            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--bg-primary)', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
              {sortDir.toUpperCase()}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Gestión de Viajes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Listado general y seguimiento de operaciones de transporte.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {selectedTrips.length > 0 && (
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }} onClick={() => setPrintMode('table')}>
              <Printer size={16} /> Imprimir Resumen ({selectedTrips.length})
            </button>
          )}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 6px -1px rgb(var(--bg-primary-rgb) / 0.2)',
            marginTop: 'auto'
          }}
            onClick={() => setFormTrip(null)}>
            <Plus size={18} /> Nuevo Viaje
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desde:</span>
          <input type="date" className="input-field" style={{ width: '150px' }} value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hasta:</span>
          <input type="date" className="input-field" style={{ width: '150px' }} value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por código, ruta, chofer..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={verArchivados} onChange={(e) => setVerArchivados(e.target.checked)} /> Ver Archivados
          </label>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" checked={viajes.length > 0 && selectedTrips.length === viajes.length} onChange={toggleSelectAll} /></th>
                <SortableHeader title="#" column="id" />
                <SortableHeader title="Cliente" column="cliente" />
                <SortableHeader title="Proveedor" column="proveedor" />
                <SortableHeader title="Ruta" column="ruta" />
                <SortableHeader title="Unidad" column="unidad" />
                <SortableHeader title="Chofer" column="chofer" />
                <SortableHeader title="Estado" column="estado" />
                <SortableHeader title="Precio (Cli)" column="precio_pactado" style={{ textAlign: 'right' }} />
                <SortableHeader title="Costo (Prov)" column="costo_proveedor" style={{ textAlign: 'right' }} />
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="spinner"></div>
                      <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando viajes...</p>
                    </div>
                  </td>
                </tr>
              ) : viajes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No hay viajes cargados.</td>
                </tr>
              ) : (
                viajes.map(trip => {
                  const isExpanded = expandedTrip === trip.id;

                  return (
                    <React.Fragment key={trip.id}>
                      <tr style={{ opacity: trip.deleted_at ? 0.6 : 1 }}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" checked={selectedTrips.includes(trip.id)} onChange={() => toggleTripSelection(trip.id)} />
                        </td>
                        <td style={{ fontWeight: '500' }}>
                          {trip.codigo_viaje}
                          {trip.deleted_at && <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--color-danger-text)' }}>ARCHIVADO</span>}
                        </td>
                        <td>{getClienteName(trip)}</td>
                        <td>{getProveedorName(trip) || <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Flota propia</span>}</td>
                        <td>{trip.origen} {' → '} {trip.destino}</td>
                        <td style={{ fontSize: '0.8rem' }}>{getUnidadLabel(trip)}</td>
                        <td>{getChoferName(trip)}</td>
                        <td>{getStatusBadge(trip.estado)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(trip.precio_pactado)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500', color: trip.costo_proveedor > 0 ? 'var(--color-danger-text)' : 'inherit' }}>{trip.costo_proveedor > 0 ? formatCurrency(trip.costo_proveedor) : '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {!trip.deleted_at ? (
                              <button
                                className="outline"
                                style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                                onClick={() => setFormTrip(trip)}
                                title="Editar viaje"
                              >
                                <Edit size={14} />
                              </button>
                            ) : (
                              <button
                                className="outline success"
                                style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', borderColor: 'var(--color-success-text)', color: 'var(--color-success-text)' }}
                                onClick={async () => {
                                  await fetch(`${API_BASE_URL}/viajes/${trip.id}/restore`, { method: 'POST' });
                                  fetchViajes();
                                }}
                                title="Desarchivar viaje"
                              >
                                Restaurar
                              </button>
                            )}
                            <button
                              className="outline"
                              style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                              onClick={() => { setTripToPrint(trip); setPrintMode('sheet'); }}
                              title="Imprimir Hoja de Ruta"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              className="outline"
                              style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                              onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                            >
                              Detalle <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                          <td colSpan="12" style={{ padding: '1rem' }}>
                            <TripDetail
                              trip={trip}
                              onRefresh={() => fetchViajes(currentPage)}
                              onPrint={(mode, subType, item, viaje) => {
                                setPrintMode(mode);
                                setPrintSubType(subType);
                                setTripToPrint(viaje);
                                setPrintItem(item);
                              }}
                              setConfirmCfg={setConfirmCfg}
                              setAlertMsg={setAlertMsg}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (Total: {totalRecords} viajes)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="outline"
                style={{ padding: '0.4rem 0.5rem', display: 'flex' }}
                disabled={currentPage <= 1 || loading}
                onClick={() => { setCurrentPage(c => c - 1); fetchViajes(currentPage - 1, sortBy, sortDir); }}
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      className={currentPage === pageNum ? "" : "outline"}
                      style={{ padding: '0.2rem 0.75rem', minWidth: '32px' }}
                      disabled={currentPage === pageNum || loading}
                      onClick={() => { setCurrentPage(pageNum); fetchViajes(pageNum, sortBy, sortDir); }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} style={{ color: 'var(--text-muted)' }}>...</span>;
                }
                return null;
              })}

              <button
                className="outline"
                style={{ padding: '0.4rem 0.5rem', display: 'flex' }}
                disabled={currentPage >= totalPages || loading}
                onClick={() => { setCurrentPage(c => c + 1); fetchViajes(currentPage + 1, sortBy, sortDir); }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {formTrip !== undefined && (
        <TripFormModal trip={formTrip} onClose={() => setFormTrip(undefined)} onSave={fetchViajes} clientes={clientes} unidades={unidades} choferes={choferes} proveedores={proveedores} />
      )}

      {printMode === 'table' && selectedTrips.length > 0 && (
        <PrintPortal>
          <PrintSelectedTable viajes={viajes.filter(v => selectedTrips.includes(v.id))} />
        </PrintPortal>
      )}

      {printMode === 'sheet' && tripToPrint && (
        <PrintPortal>
          <PrintTripSheet viaje={tripToPrint} />
        </PrintPortal>
      )}

      {printMode === 'receipt' && tripToPrint && printItem && (
        <PrintPortal>
          <PrintReceipt type={printSubType} item={printItem} viaje={tripToPrint} />
        </PrintPortal>
      )}

      {printMode === 'document' && tripToPrint && printItem && (
        <PrintPortal>
          <PrintDocumentVoucher type={printSubType} item={printItem} viaje={tripToPrint} />
        </PrintPortal>
      )}

      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
      {confirmCfg && <ConfirmModal message={confirmCfg.message} onConfirm={confirmCfg.action} onClose={() => setConfirmCfg(null)} />}
    </div>
  );
};

export default Trips;
