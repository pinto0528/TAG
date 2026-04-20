import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { mockViajes, mockProveedores, mockChoferes, mockUnidades, mockFleteros, mockFacturas, mockOrdenesPago, mockCheques } from '../data/mockData';
import { Plus, ChevronDown, Edit, DollarSign, Package, FileText, Truck as TruckIcon, ArrowRight, CheckCircle2, Clock, Printer, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);

const getStatusBadge = (status) => {
  switch (status) {
    case 'finalizado': return <span className="badge success">Finalizado</span>;
    case 'en_curso': return <span className="badge info">En curso</span>;
    case 'pendiente': return <span className="badge warning">Pendiente</span>;
    case 'cancelado': return <span className="badge danger">Cancelado</span>;
    default: return <span className="badge">{status}</span>;
  }
};

const getProveedorName = (trip) => trip.proveedor?.razon_social || mockProveedores.find(p => p.id === trip.proveedor_id)?.razon_social || '—';
const getChoferName = (trip) => trip.chofer ? `${trip.chofer.nombre} ${trip.chofer.apellido}` : (mockChoferes.find(d => d.id === trip.chofer_id) ? `${mockChoferes.find(d => d.id === trip.chofer_id).nombre} ${mockChoferes.find(d => d.id === trip.chofer_id).apellido}` : '— Sin asignar —');
const getUnidadLabel = (trip) => trip.unidad ? `${trip.unidad.marca} ${trip.unidad.modelo} (${trip.unidad.patente})` : (mockUnidades.find(f => f.id === trip.unidad_id) ? `${mockUnidades.find(f => f.id === trip.unidad_id).marca} ${mockUnidades.find(f => f.id === trip.unidad_id).modelo} (${mockUnidades.find(f => f.id === trip.unidad_id).patente})` : '—');
const getFleteroName = (trip) => trip.fletero?.razon_social || mockFleteros.find(f => f.id === trip.fletero_id)?.razon_social || null;

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
          <th style={{ borderBottom: '2px solid black', padding: '0.4rem', textAlign: 'left' }}>Observaciones</th>
        </tr>
      </thead>
      <tbody>
        {viajes.sort((a,b) => new Date(a.fecha_salida) - new Date(b.fecha_salida)).map(trip => (
          <tr key={trip.id}>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem', whiteSpace: 'nowrap' }}><strong>{trip.codigo_viaje}</strong></td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
              Sal: {trip.fecha_salida ? trip.fecha_salida.split('T')[0] : 'S/D'} {trip.hora_salida ? trip.hora_salida.substring(11,16) : ''}<br/>
              Lle: {trip.fecha_llegada ? trip.fecha_llegada.split('T')[0] : 'S/D'} {trip.hora_llegada ? trip.hora_llegada.substring(11,16) : ''}
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{getProveedorName(trip)}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{trip.origen} → {trip.destino}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>{trip.estado.toUpperCase()}</td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
              {trip.fletero_id ? `[Tercerizado] ${getFleteroName(trip)}` : `[Propio] Chofer: ${getChoferName(trip)}`}
              {!trip.fletero_id && <><br/><span style={{ color: '#555', fontSize: '0.65rem' }}>{getUnidadLabel(trip)}</span></>}
            </td>
            <td style={{ borderBottom: '1px solid #ccc', padding: '0.4rem' }}>
               {trip.carga?.tipo_carga || 'General'}
               <span style={{ display: 'block', color: '#555', fontSize: '0.65rem' }}>
                 P: {trip.carga?.peso_kg ? `${trip.carga.peso_kg}kg` : 'S/D'} | B: {trip.carga?.cantidad_bultos || 'S/D'} | Refri: {trip.carga?.requiere_refrigeracion ? 'SÍ' : 'NO'}
               </span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Logística</h3>
          <p><strong>Origen:</strong> {viaje.origen}</p>
          <p><strong>Destino:</strong> {viaje.destino}</p>
          <br/>
          <br/>
          <p><strong>Fecha Salida:</strong> {viaje.fecha_salida ? viaje.fecha_salida.split('T')[0] : 'S/D'} {viaje.hora_salida ? viaje.hora_salida.substring(11,16) : ''}</p>
          <p><strong>Fecha Llegada:</strong> {viaje.fecha_llegada ? viaje.fecha_llegada.split('T')[0] : 'S/D'} {viaje.hora_llegada ? viaje.hora_llegada.substring(11,16) : ''}</p>
        </div>
        <div>
           <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Asignación</h3>
           <p><strong>Proveedor Carga:</strong> {getProveedorName(viaje)}</p>
           {viaje.fletero_id ? (
             <>
               <p><strong>Modalidad:</strong> Transporte Tercerizado</p>
               <p><strong>Empresa Fletera:</strong> {getFleteroName(viaje)}</p>
             </>
           ) : (
             <>
               <p><strong>Modalidad:</strong> Propia</p>
               <p><strong>Unidad Asignada:</strong> {getUnidadLabel(viaje)}</p>
               <p><strong>Chofer:</strong> {getChoferName(viaje)}</p>
             </>
           )}
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Detalles de Carga</h3>
      <div style={{ display: 'flex', gap: '3rem', marginBottom: '2rem' }}>
        <p><strong>Tipo:</strong> {viaje.carga?.tipo_carga || 'General'}</p>
        <p><strong>Peso:</strong> {viaje.carga?.peso_kg ? `${viaje.carga.peso_kg} Kg` : '—'}</p>
        <p><strong>Bultos:</strong> {viaje.carga?.cantidad_bultos || '—'}</p>
        <p><strong>Refrigeración:</strong> {viaje.carga?.requiere_refrigeracion ? 'SÍ' : 'NO'}</p>
      </div>

      <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.2rem', marginBottom: '1rem' }}>Observaciones e Instrucciones</h3>
      <p style={{ minHeight: '60px' }}>{viaje.observaciones || 'Sin indicaciones especiales.'}</p>

      <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-around', paddingTop: '2rem' }}>
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
const TripFormModal = ({ trip, onClose, onSave, proveedores, unidades, choferes, fleteros }) => {
  const isEdit = !!trip;
  const title = isEdit ? `Editar Viaje #${trip.id}` : 'Cargar Nuevo Viaje';
  const d = trip || {};

  const [tipoTransporte, setTipoTransporte] = useState(d.fletero_id ? 'tercerizado' : 'propio');
  const [proveedorId, setProveedorId] = useState(d.proveedor_id || '');
  const [unidadId, setUnidadId] = useState(d.unidad_id || '');
  const [choferId, setChoferId] = useState(d.chofer_id || '');
  const [fleteroId, setFleteroId] = useState(d.fletero_id || '');

  const dateSalida = d.fecha_salida ? d.fecha_salida.split('T')[0] : '';
  const timeSalida = d.hora_salida ? d.hora_salida.substring(11, 16) : '';
  const dateLlegada = d.fecha_llegada ? d.fecha_llegada.split('T')[0] : '';
  const timeLlegada = d.hora_llegada ? d.hora_llegada.substring(11, 16) : '';

  const [pesoKg, setPesoKg] = useState(d.carga?.peso_kg || '');
  const [bultos, setBultos] = useState(d.carga?.cantidad_bultos || '');
  const [kmRecorrido, setKmRecorrido] = useState(d.km_recorrido || '');
  const [precioManual, setPrecioManual] = useState(d.precio || '');
  const [usarManual, setUsarManual] = useState(isEdit);

  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmCfg, setConfirmCfg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const proveedor = proveedores.find(p => p.id === Number(proveedorId));

  // Auto-calculate
  const calcularPrecio = () => {
    if (!proveedor) return 0;
    switch (proveedor.unidad_medida) {
      case 'por_viaje':
      case 'viaje': return proveedor.tarifa;
      case 'por_kg':
      case 'kg': return (Number(pesoKg) || 0) * proveedor.tarifa;
      case 'tonelada': return ((Number(pesoKg) || 0) / 1000) * proveedor.tarifa;
      case 'por_km':
      case 'km': return (Number(kmRecorrido) || 0) * proveedor.tarifa;
      case 'por_bulto':
      case 'bulto': return (Number(bultos) || 0) * proveedor.tarifa;
      default: return 0;
    }
  };

  const precioCalculado = calcularPrecio();
  const precioFinal = usarManual ? (Number(precioManual) || 0) : precioCalculado;

  // What input does the proveedor need?
  const necesitaKm = proveedor?.unidad_medida === 'por_km' || proveedor?.unidad_medida === 'km';
  const necesitaPeso = proveedor?.unidad_medida === 'por_kg' || proveedor?.unidad_medida === 'kg' || proveedor?.unidad_medida === 'tonelada';
  const necesitaBultos = proveedor?.unidad_medida === 'por_bulto' || proveedor?.unidad_medida === 'bulto';

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-body)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="tipoTrans" checked={tipoTransporte === 'propio'} onChange={() => { setTipoTransporte('propio'); setFleteroId(''); }} /> Propio (Unidad/Chofer)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="tipoTrans" checked={tipoTransporte === 'tercerizado'} onChange={() => { setTipoTransporte('tercerizado'); setUnidadId(''); setChoferId(''); }} /> Tercerizado (Fletero)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Proveedor *</label>
                <select className="input-field" value={proveedorId} onChange={e => { setProveedorId(e.target.value); setUsarManual(false); }} required>
                  <option value="">Seleccione...</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social} ({UNIDAD_MEDIDA_LABELS[p.unidad_medida] || p.unidad_medida})</option>)}
                </select>
              </div>

              {tipoTransporte === 'propio' && (
                <>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>Unidad *</label>
                    <select className="input-field" value={unidadId} onChange={e => setUnidadId(e.target.value)} required={tipoTransporte === 'propio'}>
                      <option value="">Seleccione...</option>
                      {unidades.map(u => <option key={u.id} value={u.id}>{u.marca} {u.modelo} ({u.patente})</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={labelStyle}>Chofer *</label>
                    <select className="input-field" value={choferId} onChange={e => setChoferId(e.target.value)} required={tipoTransporte === 'propio'}>
                      <option value="">— Sin asignar —</option>
                      {choferes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                    </select>
                  </div>
                </>
              )}

              {tipoTransporte === 'tercerizado' && (
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Fletero *</label>
                  <select className="input-field" value={fleteroId} onChange={e => setFleteroId(e.target.value)} required={tipoTransporte === 'tercerizado'}>
                    <option value="">— Sin fletero —</option>
                    {fleteros.map(f => <option key={f.id} value={f.id}>{f.razon_social}</option>)}
                  </select>
                </div>
              )}
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

              {necesitaKm && (
                <div style={{ flex: '1 1 140px' }}>
                  <label style={labelStyle}>Distancia (km) *</label>
                  <input id="f_km" type="number" className="input-field" placeholder="0" value={kmRecorrido} onChange={e => setKmRecorrido(e.target.value)} />
                </div>
              )}
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
                <label style={labelStyle}>Peso (kg) {necesitaPeso && '*'}</label>
                <input type="number" className="input-field" placeholder="0" value={pesoKg} onChange={e => setPesoKg(e.target.value)} style={necesitaPeso ? { borderColor: 'var(--bg-primary)' } : {}} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Bultos {necesitaBultos && '*'}</label>
                <input type="number" className="input-field" placeholder="0" value={bultos} onChange={e => setBultos(e.target.value)} style={necesitaBultos ? { borderColor: 'var(--bg-primary)' } : {}} />
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

            {/* Precio Calculado (si hay proveedor) */}
            {proveedor && !usarManual && (
              <div style={{ backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Precio calculado automáticamente</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                      {UNIDAD_MEDIDA_LABELS[proveedor.unidad_medida]} — Tarifa: {formatCurrency(proveedor.tarifa)}
                      {proveedor.unidad_medida === 'por_kg' && pesoKg ? ` × ${Number(pesoKg).toLocaleString()} kg` : ''}
                      {proveedor.unidad_medida === 'por_km' && kmRecorrido ? ` × ${Number(kmRecorrido).toLocaleString()} km` : ''}
                      {proveedor.unidad_medida === 'por_bulto' && bultos ? ` × ${Number(bultos).toLocaleString()} bultos` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success-text)' }}>{formatCurrency(precioCalculado)}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input type="checkbox" id="manual" checked={usarManual} onChange={e => setUsarManual(e.target.checked)} />
                  <label htmlFor="manual" style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Ingresar precio manual</label>
                </div>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    className="input-field"
                    placeholder={usarManual ? '0' : formatCurrency(precioCalculado)}
                    style={{ paddingLeft: '2.25rem', opacity: usarManual ? 1 : 0.5 }}
                    value={usarManual ? precioManual : ''}
                    onChange={e => setPrecioManual(e.target.value)}
                    disabled={!usarManual}
                  />
                </div>
              </div>
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
                 <button type="button" className="outline danger" style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-text)' }} onClick={() => {
                    setConfirmCfg({
                      message: '¿Seguro que deseas archivar este viaje? Ya no aparecerá en el listado activo.',
                      action: async () => {
                         await fetch(`${API_BASE}/viajes/${d.id}`, { method: 'DELETE' });
                         onSave();
                         onClose();
                      }
                    });
                 }}>Archivar Viaje</button>
               )}
               {isEdit && !!d.deleted_at && (
                 <button type="button" className="outline success" style={{ color: 'var(--color-success-text)', borderColor: 'var(--color-success-text)' }} onClick={async () => {
                   await fetch(`${API_BASE}/viajes/${d.id}/restore`, { method: 'POST' });
                   onSave();
                   onClose();
                 }}>Restaurar Viaje</button>
               )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="outline" onClick={onClose}>Cancelar</button>
              {!d.deleted_at && <button type="button" disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }} onClick={async () => {
                if (isSaving) return;
                setIsSaving(true);
                const payload = {
                  tipo_transporte: tipoTransporte,
                  proveedor_id: proveedorId,
                  unidad_id: tipoTransporte === 'propio' ? (unidadId || null) : null,
                  chofer_id: tipoTransporte === 'propio' ? (choferId || null) : null,
                  fletero_id: tipoTransporte === 'tercerizado' ? (fleteroId || null) : null,
                  origen: document.getElementById('f_origen').value,
                  destino: document.getElementById('f_destino').value,
                  precio: precioFinal,
                  km_recorrido: kmRecorrido || 0,
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
                  const url = isUpdate ? `${API_BASE}/viajes/${d.id}` : `${API_BASE}/viajes`;
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
const TripDetail = ({ trip }) => {
  const [activeTab, setActiveTab] = useState('resumen');

  const totalGastos = trip.gastos?.reduce((a, g) => a + g.monto, 0) || 0;
  const totalAnticipos = trip.anticipos?.reduce((a, an) => a + an.monto, 0) || 0;
  const margen = (trip.precio || 0) - totalGastos;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

      {/* Detail Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
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

        {/* TAB 1: RESUMEN (LOGISTICA + CARGA) */}
        {activeTab === 'resumen' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={subHeaderStyle}><TruckIcon size={14} />Logística</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <InfoLine label="Chofer" value={getChoferName(trip)} />
                <InfoLine label="Unidad" value={getUnidadLabel(trip)} />
                <InfoLine label="Fletero" value={getFleteroName(trip) || 'Propio'} />
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
                  {trip.carga.requiere_refrigeracion && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontWeight: 500, fontSize: '0.8rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9' }}></div> Frío Requerido
                    </div>
                  )}
                </div>
              ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga sin especificar.</p>}
            </div>
          </div>
        )}

        {/* TAB 2: FINANZAS (GASTOS + MARGEN) */}
        {activeTab === 'finanzas' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 400px' }}>
              <h4 style={subHeaderStyle}><DollarSign size={14} />Desglose de Gastos y Anticipos</h4>
              {trip.gastos && trip.gastos.length > 0 ? (
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.5rem 0' }}>Tipo</th>
                      <th>Concepto</th>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.gastos.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.65rem 0' }}><span className="badge" style={{ backgroundColor: 'var(--bg-body)', fontSize: '0.7rem' }}>{g.tipo}</span></td>
                        <td>{g.concepto}</td>
                        <td>{g.fecha}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-danger-text)' }}>{formatCurrency(g.monto)}</td>
                      </tr>
                    ))}
                    {trip.anticipos?.map(an => (
                      <tr key={`an-${an.id}`} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                        <td style={{ padding: '0.65rem 0' }}><span className="badge success" style={{ fontSize: '0.7rem' }}>Anticipo</span></td>
                        <td>Pago Chofer / Adelanto</td>
                        <td>{an.fecha}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-success-text)' }}>-{formatCurrency(an.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hay gastos registrados aún.</p>}
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <div style={{ backgroundColor: 'var(--bg-body)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Precio Acordado</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(trip.precio)}</div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Egresos Totales</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-danger-text)' }}>-{formatCurrency(totalGastos)}</div>

                <div style={{ height: '2px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }}></div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rentabilidad Estimada</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: margen >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                  {formatCurrency(margen)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {trip.precio > 0 ? `${((margen / trip.precio) * 100).toFixed(1)}% de margen` : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTACION (THE FULL CHAIN) */}
        {activeTab === 'documentacion' && (
          <div>
            <h4 style={subHeaderStyle}><FileText size={14} />Trazabilidad de Documentación</h4>

            {trip.remitos && trip.remitos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {trip.remitos.map(r => {
                  const factura = r.factura_id ? mockFacturas.find(f => f.id === r.factura_id) : null;
                  const op = factura ? mockOrdenesPago.find(o => o.factura_id === factura.id) : null;
                  const cheques = op ? mockCheques.filter(c => c.orden_pago_id === op.id) : [];

                  return (
                    <div key={r.id} style={chainContainerStyle}>

                      {/* 1. REMITO */}
                      <div style={stepStyle}>
                        <div style={stepTitleStyle}><FileText size={14} /> Remito</div>
                        <div style={stepContentStyle}>
                          <strong>{r.numero}</strong>
                          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{r.fecha}</span>
                          <span className={`badge ${r.estado === 'conforme' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>{r.estado}</span>
                        </div>
                      </div>

                      <ArrowRight size={20} style={arrowStyle} />

                      {/* 2. FACTURA */}
                      <div style={{ ...stepStyle, opacity: factura ? 1 : 0.4 }}>
                        <div style={stepTitleStyle}><FileText size={14} /> Factura</div>
                        <div style={stepContentStyle}>
                          {factura ? (
                            <>
                              <strong>{factura.numero}</strong>
                              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{factura.fecha_emision}</span>
                              <span className={`badge ${factura.estado === 'pagada' ? 'success' : 'info'}`} style={{ fontSize: '0.65rem' }}>{factura.estado}</span>
                            </>
                          ) : <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Pendiente de Facturar</span>}
                        </div>
                      </div>

                      <ArrowRight size={20} style={arrowStyle} />

                      {/* 3. ORDEN DE PAGO */}
                      <div style={{ ...stepStyle, opacity: op ? 1 : 0.4 }}>
                        <div style={stepTitleStyle}><Clock size={14} /> Orden de Pago</div>
                        <div style={stepContentStyle}>
                          {op ? (
                            <>
                              <strong>{op.numero}</strong>
                              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{op.fecha}</span>
                              <span className={`badge ${op.estado === 'pagada' ? 'success' : 'info'}`} style={{ fontSize: '0.65rem' }}>{op.estado}</span>
                            </>
                          ) : <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>No emitida</span>}
                        </div>
                      </div>

                      <ArrowRight size={20} style={arrowStyle} />

                      {/* 4. CHEQUES */}
                      <div style={{ ...stepStyle, flex: 2, opacity: cheques.length > 0 ? 1 : 0.4 }}>
                        <div style={stepTitleStyle}><CheckCircle2 size={14} /> Cheques / Pagos</div>
                        <div style={{ ...stepContentStyle, flexDirection: 'row', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {cheques.length > 0 ? (
                            cheques.map(c => (
                              <div key={c.id} style={{ border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{c.numero}</span>
                                <span style={{ fontSize: '0.65rem' }}>{c.banco} - {formatCurrency(c.monto)}</span>
                                <span style={{ fontSize: '0.65rem', color: c.estado === 'cobrado' ? 'var(--color-success-text)' : 'var(--color-warning-text)' }}>{c.estado}</span>
                              </div>
                            ))
                          ) : <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Sin cobros/pagos</span>}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin remitos cargados para este viaje.</p>}
          </div>
        )}

      </div>
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

  const [proveedores, setProveedores] = useState(mockProveedores);
  const [unidades, setUnidades] = useState(mockUnidades);
  const [choferes, setChoferes] = useState(mockChoferes);
  const [fleteros, setFleteros] = useState(mockFleteros);
  const [verArchivados, setVerArchivados] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState([]);

  const [printMode, setPrintMode] = useState(null);
  const [tripToPrint, setTripToPrint] = useState(null);

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
    if(e.target.checked) setSelectedTrips(viajes.map(v => v.id));
    else setSelectedTrips([]);
  };

  const toggleTripSelection = (id) => {
    if(selectedTrips.includes(id)) setSelectedTrips(selectedTrips.filter(tId => tId !== id));
    else setSelectedTrips([...selectedTrips, id]);
  };

  const fetchViajes = async (page = currentPage, forceSortBy = sortBy, forceSortDir = sortDir) => {
    setLoading(true);
    try {
      let url = `${API_BASE}/viajes?page=${page}`;
      if (verArchivados) url += '&archivados=1';
      if (forceSortBy && forceSortDir) {
        url += `&sort_by=${forceSortBy}&sort_dir=${forceSortDir}`;
      }
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
      const [provRes, uniRes, choRes, fleRes] = await Promise.all([
        fetch(`${API_BASE}/proveedores`),
        fetch(`${API_BASE}/unidades`),
        fetch(`${API_BASE}/choferes`),
        fetch(`${API_BASE}/fleteros`)
      ]);
      if (provRes.ok) setProveedores(await provRes.json());
      if (uniRes.ok) setUnidades(await uniRes.json());
      if (choRes.ok) setChoferes(await choRes.json());
      if (fleRes.ok) setFleteros(await fleRes.json());
    } catch (e) {
      console.error("Error fetching options:", e);
    }
  };

  React.useEffect(() => {
    setCurrentPage(1);
    fetchViajes(1, sortBy, sortDir);
  }, [verArchivados]);

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
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Viajes</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {selectedTrips.length > 0 && (
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7', color: 'white', borderColor: '#0284c7' }} onClick={() => setPrintMode('table')}>
              <Printer size={16} /> Imprimir Resumen ({selectedTrips.length})
            </button>
          )}
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setFormTrip(null)}>
            <Plus size={18} /> Nuevo Viaje
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', flexWrap: 'wrap' }}>
        <input type="text" className="input-field" placeholder="Buscar en viajes..." style={{ flex: '1 1 200px' }} />
        <input type="date" className="input-field" style={{ width: '150px' }} />
        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={verArchivados} onChange={(e) => setVerArchivados(e.target.checked)} /> Mostrar Archivados solos
          </label>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}><input type="checkbox" checked={viajes.length > 0 && selectedTrips.length === viajes.length} onChange={toggleSelectAll} /></th>
                <th>#</th>
                <SortableHeader title="Proveedor" column="proveedor" />
                <SortableHeader title="Ruta" column="ruta" />
                <SortableHeader title="Unidad" column="unidad" />
                <SortableHeader title="Chofer" column="chofer" />
                <SortableHeader title="Estado" column="estado" />
                <SortableHeader title="Precio" column="precio" style={{ textAlign: 'right' }} />
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando viajes...</div>
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
                        <td>{getProveedorName(trip)}</td>
                        <td>{trip.origen} {'→'} {trip.destino}</td>
                        <td style={{ fontSize: '0.8rem' }}>{getUnidadLabel(trip)}</td>
                        <td>{getChoferName(trip)}</td>
                        <td>{getStatusBadge(trip.estado)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(trip.precio)}</td>
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
                                   await fetch(`${API_BASE}/viajes/${trip.id}/restore`, { method: 'POST' });
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
                          <td colSpan="9" style={{ padding: '1rem' }}>
                            <TripDetail trip={trip} />
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
        <TripFormModal trip={formTrip} onClose={() => setFormTrip(undefined)} onSave={fetchViajes} proveedores={proveedores} unidades={unidades} choferes={choferes} fleteros={fleteros} />
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
    </div>
  );
};

export default Trips;
