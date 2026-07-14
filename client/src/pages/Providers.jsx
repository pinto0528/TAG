import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Mail, Phone, MapPin, Briefcase, RefreshCw, X, Trash2, FileText } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verArchivados, setVerArchivados] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmCfg, setConfirmCfg] = useState(null);
  const [formData, setFormData] = useState({
    razon_social: '',
    cuit: '',
    direccion: '',
    contacto: '',
    telefono: '',
    email: '',
    notas: ''
  });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/proveedores`);
      if (verArchivados) url.searchParams.append('archivados', 'true');
      if (searchQuery) url.searchParams.append('search', searchQuery);
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(Array.isArray(data) ? data : []);
      } else {
        console.error('API Error:', response.status);
        setProviders([]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [verArchivados, searchQuery]);

  const openNew = () => {
    setEditingProvider(null);
    setFormData({
      razon_social: '',
      cuit: '',
      direccion: '',
      contacto: '',
      telefono: '',
      email: '',
      notas: ''
    });
    setShowModal(true);
  };

  const openEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      razon_social: provider.razon_social || '',
      cuit: provider.cuit || '',
      direccion: provider.direccion || '',
      contacto: provider.contacto || '',
      telefono: provider.telefono || '',
      email: provider.email || '',
      notas: provider.notas || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingProvider ? 'PUT' : 'POST';
      const url = editingProvider 
        ? `${API_BASE_URL}/proveedores/${editingProvider.id}`
        : `${API_BASE_URL}/proveedores`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchProviders();
      } else {
        const errorData = await response.json();
        setAlertMsg('Error: ' + (errorData.message || 'No se pudo guardar el proveedor'));
      }
    } catch (error) {
      console.error('Error saving provider:', error);
    }
  };

  const handleArchive = async (id) => {
    setConfirmCfg({
      message: '¿Está seguro de que desea archivar este proveedor? Ya no aparecerá en el listado activo.',
      action: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            setShowModal(false);
            fetchProviders();
          }
        } catch (error) {
          console.error('Error archiving provider:', error);
        }
      }
    });
  };

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/${id}/restore`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        setShowModal(false);
        fetchProviders();
      }
    } catch (error) {
      console.error('Error restoring provider:', error);
    }
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
            {verArchivados ? 'Visualizando proveedores archivados.' : 'Administre transportistas, fleteros y prestadores de servicios externos.'}
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
            placeholder="Buscar por Razón Social, CUIT o Contacto..."
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
      <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', flex: 1 }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando proveedores...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="datatable">
              <thead>
                <tr>
                  <th>Empresa / Razón Social</th>
                  <th>CUIT / Tax ID</th>
                  <th>Contacto y Comunicación</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FileText size={48} style={{ opacity: 0.3 }} />
                        <p>No hay proveedores registrados.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  providers.map(provider => (
                    <tr key={provider.id} className="table-row-hover">
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{provider.razon_social}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={10} /> {provider.direccion || 'No especificada'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{provider.cuit}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Briefcase size={12} style={{ color: 'var(--bg-primary)' }} /> {provider.contacto || 'N/A'}
                          </span>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Phone size={10} /> {provider.telefono || 'S/T'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Mail size={10} /> {provider.email || 'S/E'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${provider.deleted_at ? 'warning' : 'success'}`}>
                          {provider.deleted_at ? 'Archivado' : 'Activo'}
                        </span>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {editingProvider ? 'Modificar Proveedor' : 'Alta de Nuevo Proveedor'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete los datos comerciales del prestador.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Razón Social / Empresa *</label>
                  <input 
                    type="text" 
                    name="razon_social"
                    className="input-field" 
                    value={formData.razon_social} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div>
                  <label style={labelStyle}>CUIT *</label>
                  <input 
                    type="text" 
                    name="cuit"
                    className="input-field" 
                    placeholder="30-00000000-0" 
                    value={formData.cuit} 
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Dirección Comercial</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="direccion"
                    className="input-field" 
                    style={{ paddingLeft: '2.25rem' }} 
                    value={formData.direccion} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Persona de Contacto</label>
                  <input 
                    type="text" 
                    name="contacto"
                    className="input-field" 
                    value={formData.contacto} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono Comercial</label>
                  <input 
                    type="text" 
                    name="telefono"
                    className="input-field" 
                    value={formData.telefono} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Institucional</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="email"
                    className="input-field" 
                    style={{ paddingLeft: '2.25rem' }} 
                    value={formData.email} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  {editingProvider && !editingProvider.deleted_at && (
                    <button 
                      type="button" 
                      className="outline" 
                      style={{ color: 'var(--color-danger-text)', borderColor: 'var(--color-danger-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleArchive(editingProvider.id)}
                    >
                      <Trash2 size={16} /> Archivar Proveedor
                    </button>
                  )}
                  {editingProvider && editingProvider.deleted_at && (
                    <button 
                      type="button" 
                      className="outline" 
                      style={{ color: 'var(--color-success-text)', borderColor: 'var(--color-success-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleRestore(editingProvider.id)}
                    >
                      <RefreshCw size={16} /> Restaurar Proveedor
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="outline" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit">
                    {editingProvider ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
      {confirmCfg && <ConfirmModal message={confirmCfg.message} onConfirm={confirmCfg.action} onClose={() => setConfirmCfg(null)} />}
    </div>
  );
};

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

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem' };

export default Providers;
