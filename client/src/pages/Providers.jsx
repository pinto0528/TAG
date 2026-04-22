import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Briefcase, ChevronRight } from 'lucide-react';

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verArchivados, setVerArchivados] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  // Mock data for UI demonstration
  const mockProviders = [
    { id: 1, razon_social: 'Transportes Rápidos S.A.', cuit: '30-88888888-9', contacto: 'Luis Moreno', email: 'lmoreno@trapsa.com', telefono: '+54 11 5555-4444', direccion: 'Piamonte 456, Buenos Aires', estado: 'activo' },
    { id: 2, razon_social: 'Fleteros Unidos Cooperativa', cuit: '30-99999999-4', contacto: 'Ana Costa', email: 'acosta@unidos.com', telefono: '+54 341 422-3311', direccion: 'Urquiza 900, Rosario', estado: 'activo' },
  ];

  const openNew = () => {
    setEditingProvider(null);
    setShowModal(true);
  };

  const openEdit = (provider) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Directorio de Proveedores
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Administre transportistas, fleteros y prestadores de servicios externos.
          </p>
        </div>
        <button 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 6px -1px rgb(var(--bg-primary-rgb) / 0.2)' 
          }}
          onClick={openNew}
        >
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por Razón Social, CUIT o Empresa..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={verArchivados} 
              onChange={(e) => setVerArchivados(e.target.checked)} 
            /> Ver Archivados
          </label>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="datatable">
            <thead>
              <tr>
                <th>Empresa / Razón Social</th>
                <th>CUIT / Tax ID</th>
                <th>Contacto Directo</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockProviders.map(provider => (
                <tr key={provider.id} className="table-row-hover">
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{provider.razon_social}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={10} /> {provider.direccion}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{provider.cuit}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Briefcase size={12} style={{ color: 'var(--bg-primary)' }} /> {provider.contacto}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={10} /> {provider.telefono}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge success">Activo</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="outline" 
                        style={{ padding: '0.4rem', border: 'none' }}
                        onClick={() => openEdit(provider)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="outline" 
                        style={{ padding: '0.4rem', border: 'none', color: 'var(--color-danger-text)' }}
                        title="Archivar"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="outline" 
                        style={{ padding: '0.4rem', border: 'none' }}
                        title="Ver Detalles"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - UI Only */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {editingProvider ? 'Modificar Proveedor' : 'Alta de Nuevo Proveedor'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete los datos fiscales y comerciales del prestador.</p>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Razón Social / Empresa *</label>
                  <input type="text" className="input-field" defaultValue={editingProvider?.razon_social} required />
                </div>
                <div>
                  <label style={labelStyle}>CUIT *</label>
                  <input type="text" className="input-field" placeholder="30-00000000-0" defaultValue={editingProvider?.cuit} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Dirección Comercial *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="input-field" style={{ paddingLeft: '2.25rem' }} defaultValue={editingProvider?.direccion} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Persona de Contacto</label>
                  <input type="text" className="input-field" defaultValue={editingProvider?.contacto} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono Comercial</label>
                  <input type="text" className="input-field" defaultValue={editingProvider?.telefono} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Institucional</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="input-field" style={{ paddingLeft: '2.25rem' }} defaultValue={editingProvider?.email} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="button" onClick={() => setShowModal(false)}>Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem' };

export default Providers;
