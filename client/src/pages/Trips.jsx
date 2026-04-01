import React, { useState } from 'react';
import { mockTrips, mockClients, mockDrivers, mockFleet } from '../data/mockData';
import { Plus, ChevronDown, DollarSign } from 'lucide-react';

const Trips = () => {
  const [showModal, setShowModal] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState(null);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Finalizado': return <span className="badge success">{status}</span>;
      case 'En curso': return <span className="badge info">{status}</span>;
      case 'Pendiente': return <span className="badge warning">{status}</span>;
      case 'Cancelado': return <span className="badge danger">{status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getClientName = (id) => mockClients.find(c => c.id === id)?.name;
  const getDriverName = (id) => mockDrivers.find(d => d.id === id)?.name;
  const getUnitName = (id) => {
    const u = mockFleet.find(f => f.id === id);
    return u ? `${u.brand} - ${u.plate}` : '';
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Viajes y Finanzas</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nuevo Viaje
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Ruta</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Ingreso</th>
                <th style={{ textAlign: 'right' }}>Gastos</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockTrips.map(trip => {
                const totalExpenses = trip.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                const margin = (trip.revenue || 0) - totalExpenses;
                const isExpanded = expandedTrip === trip.id;

                return (
                  <React.Fragment key={trip.id}>
                    <tr>
                      <td style={{ fontWeight: '500' }}>{trip.id}</td>
                      <td>{getClientName(trip.clientId)}</td>
                      <td>{trip.origin} {'->'} {trip.destination}</td>
                      <td>{getStatusBadge(trip.status)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(trip.revenue || 0)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-danger-text)' }}>{formatCurrency(totalExpenses)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="outline" 
                          style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                          onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                        >
                          Finanzas <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'Transform .2s' }} />
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <td colSpan="7" style={{ padding: '1.5rem' }}>
                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Información Logística</h4>
                              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong>Chofer:</strong> {getDriverName(trip.driverId)}</p>
                              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong>Unidad:</strong> {getUnitName(trip.unitId)}</p>
                              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong>Fecha Inicio:</strong> {trip.dateStart}</p>
                            </div>
                            
                            <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Desglose de Gastos</h4>
                              {trip.expenses && trip.expenses.length > 0 ? (
                                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    {trip.expenses.map((exp, idx) => (
                                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.5rem 0' }}>{exp.type}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-danger-text)' }}>{formatCurrency(exp.amount)}</td>
                                      </tr>
                                    ))}
                                    <tr>
                                      <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>Total Egresos</td>
                                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger-text)' }}>{formatCurrency(totalExpenses)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sin gastos registrados.</p>
                              )}
                            </div>

                            <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ backgroundColor: 'var(--bg-body)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Rentabilidad (Margen Neto)</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: margin > 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                                  {formatCurrency(margin)}
                                </div>
                              </div>
                            </div>

                          </div>
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

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Cargar Nuevo Viaje</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cliente</label>
                <select className="input-field">
                  <option value="">Selecciona un cliente</option>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Origen</label>
                  <input type="text" className="input-field" placeholder="Ej. CABA" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Destino</label>
                  <input type="text" className="input-field" placeholder="Ej. Rosario" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Precio Acordado ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="number" className="input-field" placeholder="0.00" style={{ paddingLeft: '2.25rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit">Guardar Viaje</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
