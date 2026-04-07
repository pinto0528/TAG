import React, { useState } from 'react';
import { mockProveedores as mockClients, mockViajes } from '../data/mockData';
import { Plus, ChevronDown, Edit } from 'lucide-react';

const Clients = () => {
  const [expandedClient, setExpandedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const getClientTrips = (clientId) => mockViajes.filter(t => t.proveedor_id === clientId);

  const openNew = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Directorio de Clientes</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openNew}>
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map(client => {
                const isExpanded = expandedClient === client.id;
                const clientTrips = getClientTrips(client.id);

                return (
                  <React.Fragment key={client.id}>
                    <tr>
                      <td style={{ fontWeight: '500' }}>{client.razon_social}</td>
                      <td>{client.cuit}</td>
                      <td>{client.contacto}</td>
                      <td>{client.telefono}</td>
                      <td>{client.direccion}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="outline" 
                            style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => openEdit(client)}
                            title="Modificar Cliente"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="outline"
                            style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                          >
                            Historial <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'Transform .2s' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <td colSpan="6" style={{ padding: '1rem' }}>
                          <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Últimos viajes del cliente</h4>
                            {clientTrips.length > 0 ? (
                              <table className="datatable" style={{ background: 'transparent' }}>
                                <tbody>
                                  {clientTrips.map(trip => (
                                    <tr key={trip.id}>
                                      <td width="20%">#{trip.id}</td>
                                      <td>{trip.origen} {'→'} {trip.destino}</td>
                                      <td>{trip.fecha_salida}</td>
                                      <td align="right">
                                        <span className={`badge ${trip.estado === 'finalizado' ? 'success' : 'info'}`}>{trip.estado}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p style={{ fontSize: '0.875rem' }}>No hay viajes registrados.</p>
                            )}
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
          <div className="card" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              {editingClient ? 'Modificar Cliente' : 'Alta de Cliente'}
            </h3>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Razón Social / Empresa</label>
                  <input type="text" className="input-field" placeholder="Ej. Acme Logística S.A." defaultValue={editingClient?.razon_social} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>CUIT / CUIL</label>
                  <input type="text" className="input-field" placeholder="30-12345678-9" defaultValue={editingClient?.cuit} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Dirección (Casa Central)</label>
                <input type="text" className="input-field" placeholder="Ej. Ruta Nacional 9 Km 500" defaultValue={editingClient?.direccion} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Persona de Contacto</label>
                  <input type="text" className="input-field" placeholder="Ej. Juan Pérez" defaultValue={editingClient?.contacto} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Teléfono</label>
                  <input type="text" className="input-field" placeholder="+54 9 11 0000-0000" defaultValue={editingClient?.telefono} />
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>Parámetros y Unidad de Medida</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Forma de Pago Predeterminada</label>
                    <select className="input-field" required defaultValue={editingClient ? "Cheque a 30 días" : ""}>
                      <option value="">Seleccione condición</option>
                      <option>Contado / Transferencia Inmediata</option>
                      <option>Cheque a 30 días</option>
                      <option>Cheque a 60 días</option>
                      <option>Cuenta Corriente</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Unidad de Medida (Tarifario)</label>
                    <select className="input-field" required defaultValue={editingClient ? "Precio cerrado por Viaje" : ""}>
                      <option value="">Seleccione medida base</option>
                      <option>Precio cerrado por Viaje</option>
                      <option>Tonelada (Ton)</option>
                      <option>Kilómetro (Km)</option>
                      <option>Pallet</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
