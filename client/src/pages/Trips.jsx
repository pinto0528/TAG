import React, { useState } from 'react';
import { mockViajes, mockProveedores, mockChoferes, mockUnidades, mockFleteros, mockFacturas } from '../data/mockData';
import { Plus, ChevronDown, Edit, DollarSign, Package, FileText, Truck as TruckIcon } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);

const getStatusBadge = (status) => {
  switch(status) {
    case 'finalizado': return <span className="badge success">Finalizado</span>;
    case 'en_curso': return <span className="badge info">En curso</span>;
    case 'pendiente': return <span className="badge warning">Pendiente</span>;
    case 'cancelado': return <span className="badge danger">Cancelado</span>;
    default: return <span className="badge">{status}</span>;
  }
};

const getProveedorName = (id) => mockProveedores.find(p => p.id === id)?.razon_social || '—';
const getChoferName = (id) => { const c = mockChoferes.find(d => d.id === id); return c ? `${c.nombre} ${c.apellido}` : '— Sin asignar —'; };
const getUnidadLabel = (id) => { const u = mockUnidades.find(f => f.id === id); return u ? `${u.marca} ${u.modelo} (${u.patente})` : '—'; };
const getFleteroName = (id) => mockFleteros.find(f => f.id === id)?.razon_social || null;

// ============================================================ 
// FORM MODAL (Create / Edit)
// ============================================================
const TripFormModal = ({ trip, onClose }) => {
  const isEdit = !!trip;
  const title = isEdit ? `Editar Viaje #${trip.id}` : 'Cargar Nuevo Viaje';

  // Default values from existing trip or empty
  const d = trip || {};

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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Proveedor *</label>
                <select className="input-field" defaultValue={d.proveedor_id || ''} required>
                  <option value="">Seleccione...</option>
                  {mockProveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Unidad *</label>
                <select className="input-field" defaultValue={d.unidad_id || ''} required>
                  <option value="">Seleccione...</option>
                  {mockUnidades.map(u => <option key={u.id} value={u.id}>{u.marca} {u.modelo} ({u.patente})</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Chofer</label>
                <select className="input-field" defaultValue={d.chofer_id || ''}>
                  <option value="">— Sin asignar —</option>
                  {mockChoferes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Fletero</label>
                <select className="input-field" defaultValue={d.fletero_id || ''}>
                  <option value="">— Sin fletero —</option>
                  {mockFleteros.map(f => <option key={f.id} value={f.id}>{f.razon_social}</option>)}
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
                <input type="text" className="input-field" placeholder="Ej. CABA" defaultValue={d.origen || ''} required />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Destino *</label>
                <input type="text" className="input-field" placeholder="Ej. Rosario" defaultValue={d.destino || ''} required />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Fecha Salida</label>
                <input type="date" className="input-field" defaultValue={d.fecha_salida || ''} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>Hora Salida</label>
                <input type="time" className="input-field" defaultValue={d.hora_salida || ''} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Fecha Llegada</label>
                <input type="date" className="input-field" defaultValue={d.fecha_llegada || ''} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>Hora Llegada</label>
                <input type="time" className="input-field" defaultValue={d.hora_llegada || ''} />
              </div>
            </div>
          </fieldset>

          {/* — Sección: Carga — */}
          <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <legend style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-muted)' }}>Datos de Carga</legend>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Descripción</label>
                <input type="text" className="input-field" placeholder="Ej. Electrodomésticos" defaultValue={d.carga?.descripcion || ''} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Tipo de Carga</label>
                <select className="input-field" defaultValue={d.carga?.tipo_carga || ''}>
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
                <input type="number" className="input-field" placeholder="0" defaultValue={d.carga?.peso_kg || ''} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={labelStyle}>Bultos</label>
                <input type="number" className="input-field" placeholder="0" defaultValue={d.carga?.cantidad_bultos || ''} />
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Precio Acordado ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="number" className="input-field" placeholder="0" style={{ paddingLeft: '2.25rem' }} defaultValue={d.precio || ''} />
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Estado</label>
                <select className="input-field" defaultValue={d.estado || 'pendiente'}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea className="input-field" rows="2" placeholder="Notas internas sobre el viaje..." defaultValue={d.observaciones || ''} style={{ resize: 'vertical' }} />
            </div>
          </fieldset>

          {/* — Botones — */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="outline" onClick={onClose}>Cancelar</button>
            <button type="submit">{isEdit ? 'Guardar Cambios' : 'Crear Viaje'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' };

// ============================================================ 
// EXPANDED ROW DETAIL
// ============================================================
const TripDetail = ({ trip }) => {
  const totalGastos = trip.gastos?.reduce((a, g) => a + g.monto, 0) || 0;
  const totalAnticipos = trip.anticipos?.reduce((a, an) => a + an.monto, 0) || 0;
  const margen = (trip.precio || 0) - totalGastos;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      
      {/* Col 1: Info Logística */}
      <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TruckIcon size={14}/>Logística</h4>
        <InfoLine label="Chofer" value={getChoferName(trip.chofer_id)} />
        <InfoLine label="Unidad" value={getUnidadLabel(trip.unidad_id)} />
        {getFleteroName(trip.fletero_id) && <InfoLine label="Fletero" value={getFleteroName(trip.fletero_id)} />}
        <InfoLine label="Salida" value={trip.fecha_salida ? `${trip.fecha_salida} ${trip.hora_salida || ''}` : '—'} />
        <InfoLine label="Llegada" value={trip.fecha_llegada ? `${trip.fecha_llegada} ${trip.hora_llegada || ''}` : '—'} />
        {trip.observaciones && <InfoLine label="Obs." value={trip.observaciones} />}
      </div>

      {/* Col 2: Carga */}
      <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={14}/>Carga</h4>
        {trip.carga ? (
          <>
            <InfoLine label="Descripción" value={trip.carga.descripcion} />
            <InfoLine label="Tipo" value={trip.carga.tipo_carga} />
            <InfoLine label="Peso" value={trip.carga.peso_kg ? `${trip.carga.peso_kg.toLocaleString()} kg` : '—'} />
            {trip.carga.cantidad_bultos && <InfoLine label="Bultos" value={trip.carga.cantidad_bultos} />}
            {trip.carga.requiere_refrigeracion && <span className="badge info" style={{ marginTop: '0.25rem' }}>Refrigerada</span>}
          </>
        ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin carga asignada.</p>}
      </div>

      {/* Col 3: Gastos y Anticipos */}
      <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={14}/>Finanzas</h4>
        {trip.gastos && trip.gastos.length > 0 ? (
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <tbody>
              {trip.gastos.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.35rem 0' }}>{g.tipo}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-danger-text)' }}>{formatCurrency(g.monto)}</td>
                </tr>
              ))}
              <tr><td style={{ padding: '0.35rem 0', fontWeight: 'bold' }}>Total Gastos</td><td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger-text)' }}>{formatCurrency(totalGastos)}</td></tr>
              {totalAnticipos > 0 && <tr><td style={{ padding: '0.35rem 0' }}>Anticipos</td><td style={{ textAlign: 'right' }}>{formatCurrency(totalAnticipos)}</td></tr>}
            </tbody>
          </table>
        ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin gastos registrados.</p>}

        <div style={{ backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Margen Neto</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: margen >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>{formatCurrency(margen)}</div>
        </div>
      </div>

      {/* Col 4: Remitos */}
      <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={14}/>Remitos</h4>
        {trip.remitos && trip.remitos.length > 0 ? (
          trip.remitos.map(r => (
            <div key={r.id} style={{ padding: '0.5rem', marginBottom: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 500 }}>{r.numero}</div>
              <div style={{ color: 'var(--text-muted)' }}>{r.descripcion}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span>{r.fecha}</span>
                <span className={`badge ${r.estado === 'conforme' ? 'success' : 'warning'}`}>{r.estado}</span>
              </div>
            </div>
          ))
        ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin remitos.</p>}
      </div>
    </div>
  );
};

const InfoLine = ({ label, value }) => (
  <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem' }}><span style={{ color: 'var(--text-muted)' }}>{label}:</span> {value}</p>
);

// ============================================================ 
// MAIN COMPONENT
// ============================================================
const Trips = () => {
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [formTrip, setFormTrip] = useState(undefined); // undefined = closed, null = new, object = edit

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Viajes</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setFormTrip(null)}>
          <Plus size={18} /> Nuevo Viaje
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th>#</th>
                <th>Proveedor</th>
                <th>Ruta</th>
                <th>Unidad</th>
                <th>Chofer</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockViajes.map(trip => {
                const isExpanded = expandedTrip === trip.id;
                const totalGastos = trip.gastos?.reduce((a, g) => a + g.monto, 0) || 0;

                return (
                  <React.Fragment key={trip.id}>
                    <tr>
                      <td style={{ fontWeight: '500' }}>{trip.id}</td>
                      <td>{getProveedorName(trip.proveedor_id)}</td>
                      <td>{trip.origen} {'→'} {trip.destino}</td>
                      <td style={{ fontSize: '0.8rem' }}>{getUnidadLabel(trip.unidad_id)}</td>
                      <td>{getChoferName(trip.chofer_id)}</td>
                      <td>{getStatusBadge(trip.estado)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(trip.precio)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            className="outline"
                            style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                            onClick={() => setFormTrip(trip)}
                            title="Editar viaje"
                          >
                            <Edit size={14} />
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
                        <td colSpan="8" style={{ padding: '1rem' }}>
                          <TripDetail trip={trip} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {formTrip !== undefined && (
        <TripFormModal trip={formTrip} onClose={() => setFormTrip(undefined)} />
      )}
    </div>
  );
};

export default Trips;
