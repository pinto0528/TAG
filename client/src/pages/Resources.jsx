import React, { useState, useEffect } from 'react';
import { User, Truck, Plus, Edit, Trash2, Search, X, Check, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const Resources = () => {
    const [activeTab, setActiveTab] = useState('choferes'); // 'choferes' or 'unidades'
    const [choferes, setChoferes] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'choferes' ? 'choferes' : 'unidades';
            const res = await fetch(`${API_BASE_URL}/${endpoint}?search=${search}&archivados=${showArchived}`);
            const data = await res.json();
            if (activeTab === 'choferes') {
                setChoferes(data);
            } else {
                setUnidades(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, search, showArchived]);

    const handleSave = async (payload) => {
        const endpoint = activeTab === 'choferes' ? 'choferes' : 'unidades';
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `${API_BASE_URL}/${endpoint}/${editingItem.id}` : `${API_BASE_URL}/${endpoint}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                setEditingItem(null);
                fetchData();
            } else {
                const err = await res.json();
                alert('Error al guardar: ' + JSON.stringify(err.errors || err.message));
            }
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas archivar este elemento?')) return;
        const endpoint = activeTab === 'choferes' ? 'choferes' : 'unidades';
        try {
            const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleRestore = async (id) => {
        const endpoint = activeTab === 'choferes' ? 'choferes' : 'unidades';
        try {
            const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}/restore`, { method: 'POST' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error restoring:', error);
        }
    };

    const handleToggleActive = async (item) => {
        const endpoint = activeTab === 'choferes' ? 'choferes' : 'unidades';
        const payload = { ...item, activo: !item.activo };
        try {
            const res = await fetch(`${API_BASE_URL}/${endpoint}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animate: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        Recursos del Sistema
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Gestiona choferes y unidades de la flota.
                    </p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setShowModal(true); }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 4px 6px -1px rgb(var(--bg-primary-rgb) / 0.2)' 
                    }}
                >
                    <Plus size={18} /> {activeTab === 'choferes' ? 'Nuevo Chofer' : 'Nueva Unidad'}
                </button>
            </div>

            {/* Filters and Tabs */}
            <div className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-body)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                    <button 
                        className={activeTab === 'choferes' ? '' : 'outline'}
                        style={{ border: 'none', background: activeTab === 'choferes' ? 'white' : 'transparent', color: activeTab === 'choferes' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'choferes' ? 'var(--shadow-sm)' : 'none' }}
                        onClick={() => setActiveTab('choferes')}
                    >
                        <User size={16} style={{ marginRight: '0.5rem' }} /> Choferes
                    </button>
                    <button 
                        className={activeTab === 'unidades' ? '' : 'outline'}
                        style={{ border: 'none', background: activeTab === 'unidades' ? 'white' : 'transparent', color: activeTab === 'unidades' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'unidades' ? 'var(--shadow-sm)' : 'none' }}
                        onClick={() => setActiveTab('unidades')}
                    >
                        <Truck size={16} style={{ marginRight: '0.5rem' }} /> Unidades
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder={`Buscar por nombre, patente, DNI...`} 
                            style={{ paddingLeft: '2.5rem' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <input 
                    type="checkbox" 
                    id="showArchived" 
                    checked={showArchived} 
                    onChange={e => setShowArchived(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                   />
                   <label htmlFor="showArchived" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Ver archivados</label>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {(activeTab === 'choferes' ? choferes : unidades).map(item => (
                        <ItemCard 
                            key={item.id} 
                            item={item} 
                            type={activeTab} 
                            onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                    {(activeTab === 'choferes' ? choferes : unidades).length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <Modal 
                    title={editingItem ? `Editar ${activeTab === 'choferes' ? 'Chofer' : 'Unidad'}` : `Nuevo ${activeTab === 'choferes' ? 'Chofer' : 'Unidad'}`} 
                    onClose={() => setShowModal(false)}
                >
                    <Form 
                        type={activeTab} 
                        initialData={editingItem} 
                        onSave={handleSave} 
                        onCancel={() => setShowModal(false)} 
                    />
                </Modal>
            )}
        </div>
    );
};

const ItemCard = ({ item, type, onEdit, onDelete, onRestore, onToggleActive }) => {
    const isArchived = !!item.deleted_at;
    
    return (
        <div className="card" style={{ 
            display: 'flex', flexDirection: 'column', gap: '1rem', 
            position: 'relative', overflow: 'hidden',
            opacity: isArchived ? 0.6 : 1,
            borderLeft: `4px solid ${item.activo ? 'var(--color-success-text)' : 'var(--color-danger-text)'}`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                        background: item.activo ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', 
                        padding: '0.75rem', borderRadius: 'var(--radius-md)',
                        color: item.activo ? 'var(--color-success-text)' : 'var(--color-danger-text)'
                    }}>
                        {type === 'choferes' ? <User size={24} /> : <Truck size={24} />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                            {type === 'choferes' ? `${item.nombre} ${item.apellido}` : item.patente}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {type === 'choferes' ? `DNI: ${item.dni || 'S/D'}` : `${item.marca || ''} ${item.modelo || ''} (${item.anio || '—'})`}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {!isArchived && (
                        <>
                            <button className="outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => onEdit(item)}><Edit size={16} /></button>
                            <button className="outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => onDelete(item.id)}><Trash2 size={16} /></button>
                        </>
                    )}
                    {isArchived && (
                        <button className="outline" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => onRestore(item.id)}>Restaurar</button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
                {type === 'choferes' ? (
                    <>
                        <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Teléfono</span>
                            <strong>{item.telefono || '—'}</strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Licencia Venc.</span>
                            <strong style={{ color: isNearExpiry(item.licencia_vencimiento) ? 'var(--color-danger-text)' : 'inherit' }}>
                                {item.licencia_vencimiento ? new Date(item.licencia_vencimiento).toLocaleDateString() : '—'}
                            </strong>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>VTV Venc.</span>
                            <strong style={{ color: isNearExpiry(item.vtv_vencimiento) ? 'var(--color-danger-text)' : 'inherit' }}>
                                {item.vtv_vencimiento ? new Date(item.vtv_vencimiento).toLocaleDateString() : '—'}
                            </strong>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Seguro Venc.</span>
                            <strong style={{ color: isNearExpiry(item.seguro_vencimiento) ? 'var(--color-danger-text)' : 'inherit' }}>
                                {item.seguro_vencimiento ? new Date(item.seguro_vencimiento).toLocaleDateString() : '—'}
                            </strong>
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span className={`badge ${item.activo ? 'success' : 'danger'}`} style={{ fontSize: '0.7rem' }}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                </span>
                {!isArchived && (
                    <button 
                        className="outline" 
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => onToggleActive(item)}
                    >
                        Marcar como {item.activo ? 'Inactivo' : 'Activo'}
                    </button>
                )}
            </div>
        </div>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
    }}>
        <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.25rem' }}><X size={20} /></button>
            </div>
            {children}
        </div>
    </div>
);

const Form = ({ type, initialData, onSave, onCancel }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        activo: true,
        tipo: type === 'unidades' ? 'Camión' : undefined
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {type === 'choferes' ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Nombre *</label>
                            <input name="nombre" value={formData.nombre || ''} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Apellido *</label>
                            <input name="apellido" value={formData.apellido || ''} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>DNI</label>
                        <input name="dni" value={formData.dni || ''} onChange={handleChange} className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Teléfono</label>
                            <input name="telefono" value={formData.telefono || ''} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Dirección</label>
                        <input name="direccion" value={formData.direccion || ''} onChange={handleChange} className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Venc. Licencia</label>
                            <input type="date" name="licencia_vencimiento" value={formData.licencia_vencimiento || ''} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label style={labelStyle}>Venc. LINTI</label>
                            <input type="date" name="linti_vencimiento" value={formData.linti_vencimiento || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Patente *</label>
                            <input name="patente" value={formData.patente || ''} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label style={labelStyle}>Nro Interno</label>
                            <input name="numero_interno" value={formData.numero_interno || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Marca</label>
                            <input name="marca" value={formData.marca || ''} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label style={labelStyle}>Modelo</label>
                            <input name="modelo" value={formData.modelo || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Año</label>
                            <input type="number" name="anio" value={formData.anio || ''} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label style={labelStyle}>Tipo</label>
                            <select name="tipo" value={formData.tipo || 'Camión'} onChange={handleChange} className="input-field">
                                <option>Camión</option>
                                <option>Acoplado</option>
                                <option>Semi</option>
                                <option>Furgón</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Venc. VTV</label>
                            <input type="date" name="vtv_vencimiento" value={formData.vtv_vencimiento || ''} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label style={labelStyle}>Venc. Seguro</label>
                            <input type="date" name="seguro_vencimiento" value={formData.seguro_vencimiento || ''} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" name="activo" id="activo" checked={formData.activo} onChange={handleChange} />
                <label htmlFor="activo" style={{ fontSize: '0.875rem' }}>Recurso Activo</label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="outline" onClick={onCancel}>Cancelar</button>
                <button type="submit" disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                            Guardando...
                        </div>
                    ) : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem' };

const isNearExpiry = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 15; // Warn if less than 15 days
};

export default Resources;
