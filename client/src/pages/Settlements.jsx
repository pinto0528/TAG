import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, FileText, Printer, Users, Briefcase, Eye, X, ChevronRight, ChevronLeft, Trash2, RotateCcw, AlertTriangle, CheckSquare } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-AR');
};

const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(new Date(now).setDate(diff));
    const end = new Date(new Date(now).setDate(diff + 6));
    return {
        desde: start.toISOString().split('T')[0],
        hasta: end.toISOString().split('T')[0]
    };
};

const getEntityName = (liq) => {
    if (liq.tipo === 'cliente') return liq.cliente?.razon_social || 'Sin cliente';
    return liq.proveedor?.razon_social || 'Sin proveedor';
};

const getViajeCodigo = (v) => v.codigo_viaje || `VIA-${String(v.id).padStart(4, '0')}`;

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

const PrintLiquidacionSheet = ({ data }) => {
    if (!data) return null;
    const viajes = data.viajes || [];
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
            <style>
                {`@media print { @page { size: landscape; margin: 10mm; } }`}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase' }}>LIQUIDACIÓN DE {data.tipo}</h1>
                    <h2 style={{ margin: '5px 0 0 0', fontSize: '18px', color: '#555' }}>TAG Logística S.A.</h2>
                </div>
                <div style={{ textAlign: 'right', fontSize: '14px' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Fecha Emisión:</strong> {formatDate(data.fecha_emision)}</p>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Liquidación Nro:</strong> {data.numero}</p>
                    <p style={{ margin: 0 }}><strong>{data.tipo === 'cliente' ? 'Cliente' : 'Proveedor'}:</strong> {getEntityName(data)}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Código</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Origen / Destino</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Chofer / Unidad</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Gastos</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Anticipos</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {viajes.map((v) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{formatDate(v.fecha_salida)}</td>
                            <td style={{ padding: '8px' }}>{getViajeCodigo(v)}</td>
                            <td style={{ padding: '8px' }}>{v.origen} → {v.destino}</td>
                            <td style={{ padding: '8px' }}>{v.chofer?.nombre} {v.chofer?.apellido} ({v.unidad?.patente})</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(v.total_gastos)}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(v.total_anticipos)}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(v.pivot?.monto ?? v.precio_pactado)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #333' }}>
                        <td colSpan="6" style={{ padding: '12px 8px', textAlign: 'right' }}>TOTAL A LIQUIDAR:</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>{formatCurrency(data.total)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '80px' }}>
                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #333', paddingTop: '10px', fontSize: '12px' }}>
                    <p style={{ margin: 0 }}>Emitido por</p>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>TAG Logística</p>
                </div>
                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #333', paddingTop: '10px', fontSize: '12px' }}>
                    <p style={{ margin: 0 }}>Recibí Conforme</p>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Firma y Aclaración</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// WIZARD COMPONENT
// ============================================================
const LiquidacionWizard = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [tipo, setTipo] = useState('proveedor');
    const [entidadId, setEntidadId] = useState('');
    const [entidades, setEntidades] = useState([]);
    const [loadingEntidades, setLoadingEntidades] = useState(false);
    const [loadingViajes, setLoadingViajes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [filtrosActivos, setFiltrosActivos] = useState({ fecha: false, origen: false, destino: false });
    const [filtros, setFiltros] = useState(() => {
        const range = getWeekRange();
        return { desde: range.desde, hasta: range.hasta, origen: '', destino: '' };
    });

    const [viajesDisponibles, setViajesDisponibles] = useState([]);
    const [viajesSeleccionados, setViajesSeleccionados] = useState([]);
    const [montosEditados, setMontosEditados] = useState({});

    const [liquidacionTempId, setLiquidacionTempId] = useState(null);

    useEffect(() => {
        const fetchEntidades = async () => {
            setLoadingEntidades(true);
            try {
                const endpoint = tipo === 'cliente' ? 'clientes' : 'proveedores';
                const res = await fetch(`${API_BASE_URL}/${endpoint}`);
                if (!res.ok) throw new Error('Error al cargar entidades');
                const data = await res.json();
                setEntidades(data);
            } catch (err) {
                console.error(err);
                setEntidades([]);
            } finally {
                setLoadingEntidades(false);
            }
        };
        fetchEntidades();
        setEntidadId('');
    }, [tipo]);

    const handleSearch = async () => {
        setLoadingViajes(true);
        setError('');
        try {
            const body = {
                tipo,
                fecha_emision: new Date().toISOString().split('T')[0],
            };
            if (tipo === 'cliente') {
                body.cliente_id = parseInt(entidadId);
            } else {
                body.proveedor_id = parseInt(entidadId);
            }

            const createRes = await fetch(`${API_BASE_URL}/liquidaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!createRes.ok) {
                const errData = await createRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al crear liquidación temporal');
            }
            const created = await createRes.json();
            setLiquidacionTempId(created.id);

            const params = new URLSearchParams();
            if (filtrosActivos.fecha && filtros.desde) params.set('fecha_desde', filtros.desde);
            if (filtrosActivos.fecha && filtros.hasta) params.set('fecha_hasta', filtros.hasta);
            if (filtrosActivos.origen && filtros.origen) params.set('origen', filtros.origen);
            if (filtrosActivos.destino && filtros.destino) params.set('destino', filtros.destino);

            const viajesRes = await fetch(`${API_BASE_URL}/liquidaciones/${created.id}/viajes-disponibles?${params.toString()}`);
            if (!viajesRes.ok) throw new Error('Error al buscar viajes');
            const viajes = await viajesRes.json();
            setViajesDisponibles(viajes);
            setViajesSeleccionados(viajes.map(v => v.id));
            const montosInit = {};
            viajes.forEach(v => { montosInit[v.id] = v.precio_pactado; });
            setMontosEditados(montosInit);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingViajes(false);
        }
    };

    const toggleSelection = (id) => {
        setViajesSeleccionados(prev =>
            prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
        );
    };

    const handleMontoChange = (viajeId, value) => {
        const num = parseFloat(value);
        setMontosEditados(prev => ({
            ...prev,
            [viajeId]: isNaN(num) ? 0 : num
        }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const viajesBody = viajesSeleccionados.map(id => ({
                viaje_id: id,
                monto: montosEditados[id] ?? 0,
            }));

            const res = await fetch(`${API_BASE_URL}/liquidaciones/${liquidacionTempId}/viajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viajes: viajesBody }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al agregar viajes');
            }
            const finalLiq = await res.json();
            onSave(finalLiq);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (liquidacionTempId) {
            try {
                await fetch(`${API_BASE_URL}/liquidaciones/${liquidacionTempId}`, { method: 'DELETE' });
            } catch (_) {
                // best effort cleanup
            }
        }
        onClose();
    };

    const totalSeleccionado = viajesDisponibles
        .filter(v => viajesSeleccionados.includes(v.id))
        .reduce((acc, v) => acc + (montosEditados[v.id] ?? v.precio_pactado), 0);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Nueva Liquidación</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paso {step} de 2: {step === 1 ? 'Parámetros de búsqueda' : 'Selección de viajes'}</p>
                    </div>
                    <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Liquidación</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tipo" checked={tipo === 'proveedor'} onChange={() => setTipo('proveedor')} /> Proveedor
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tipo" checked={tipo === 'cliente'} onChange={() => setTipo('cliente')} /> Cliente
                                    </label>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Entidad a Liquidar</label>
                                <select className="input-field" value={entidadId} onChange={e => setEntidadId(e.target.value)} disabled={loadingEntidades}>
                                    <option value="">{loadingEntidades ? 'Cargando...' : 'Seleccione...'}</option>
                                    {entidades.map(e => (
                                        <option key={e.id} value={e.id}>{e.razon_social}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', margin: 0 }}>Filtros de Búsqueda</h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!filtrosActivos.fecha && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, fecha: true }))}>+ Fecha</button>}
                                    {!filtrosActivos.origen && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, origen: true }))}>+ Origen</button>}
                                    {!filtrosActivos.destino && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, destino: true }))}>+ Destino</button>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filtrosActivos.fecha && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Desde</label>
                                            <input type="date" className="input-field" value={filtros.desde} onChange={e => setFiltros(prev => ({ ...prev, desde: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hasta</label>
                                            <input type="date" className="input-field" value={filtros.hasta} onChange={e => setFiltros(prev => ({ ...prev, hasta: e.target.value }))} />
                                        </div>
                                        <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, fecha: false }))}><X size={16} /></button>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {filtrosActivos.origen && (
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Origen</label>
                                                <input type="text" className="input-field" placeholder="Ej: Buenos Aires" value={filtros.origen} onChange={e => setFiltros(prev => ({ ...prev, origen: e.target.value }))} />
                                            </div>
                                            <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)', marginTop: '1.2rem' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, origen: false }))}><X size={16} /></button>
                                        </div>
                                    )}
                                    {filtrosActivos.destino && (
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Destino</label>
                                                <input type="text" className="input-field" placeholder="Ej: Rosario" value={filtros.destino} onChange={e => setFiltros(prev => ({ ...prev, destino: e.target.value }))} />
                                            </div>
                                            <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)', marginTop: '1.2rem' }} onClick={() => setFiltrosActivos(prev => ({ ...prev, destino: false }))}><X size={16} /></button>
                                        </div>
                                    )}
                                </div>

                                {!filtrosActivos.fecha && !filtrosActivos.origen && !filtrosActivos.destino && (
                                    <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Sin filtros adicionales. Se buscarán todos los viajes pendientes.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={!entidadId || loadingViajes} onClick={handleSearch}>
                                {loadingViajes ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Buscando...</> : <>Buscar Viajes <ChevronRight size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                        {viajesDisponibles.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <FileText size={48} style={{ opacity: 0.3 }} />
                                    <p>No hay viajes disponibles para los filtros seleccionados.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                                    Seleccione los viajes que desea incluir en esta liquidación. Puede editar el monto de cada viaje.
                                </div>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
                                    <table className="datatable" style={{ margin: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={viajesSeleccionados.length === viajesDisponibles.length && viajesDisponibles.length > 0}
                                                        onChange={e => setViajesSeleccionados(e.target.checked ? viajesDisponibles.map(v => v.id) : [])}
                                                    />
                                                </th>
                                                <th>Fecha</th>
                                                <th>Origen - Destino</th>
                                                <th>Chofer / Unidad</th>
                                                <th style={{ textAlign: 'right' }}>Precio del Viaje</th>
                                                <th style={{ textAlign: 'right' }}>Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viajesDisponibles.map(v => (
                                                <tr key={v.id} style={{ cursor: 'pointer', backgroundColor: viajesSeleccionados.includes(v.id) ? 'var(--bg-hover)' : 'transparent' }} onClick={() => toggleSelection(v.id)}>
                                                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                                        <input type="checkbox" checked={viajesSeleccionados.includes(v.id)} onChange={() => toggleSelection(v.id)} />
                                                    </td>
                                                    <td>{formatDate(v.fecha_salida)}</td>
                                                    <td>{v.origen} → {v.destino}</td>
                                                    <td>
                                                        <span style={{ display: 'block', fontSize: '0.85rem' }}>{v.chofer?.nombre} {v.chofer?.apellido}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.unidad?.patente}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCurrency(v.precio_pactado)}</td>
                                                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                        <input
                                                            type="number"
                                                            className="input-field"
                                                            style={{ width: '120px', textAlign: 'right', fontSize: '0.85rem' }}
                                                            value={montosEditados[v.id] ?? ''}
                                                            onChange={e => handleMontoChange(v.id, e.target.value)}
                                                            min="0"
                                                            step="1000"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <button className="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setStep(1); setViajesDisponibles([]); setViajesSeleccionados([]); }}>
                                <ChevronLeft size={18} /> Atrás
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Seleccionado ({viajesSeleccionados.length})</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--bg-primary)' }}>
                                        {formatCurrency(totalSeleccionado)}
                                    </span>
                                </div>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={viajesSeleccionados.length === 0 || loading} onClick={handleGenerate}>
                                    {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Generando...</> : 'Generar Liquidación'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// PREVIEW MODAL COMPONENT
// ============================================================
const LiquidacionPreview = ({ data, onClose, onPrint }) => {
    if (!data) return null;
    const viajes = data.viajes || [];
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '90%', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} color="var(--bg-primary)" /> Vista Previa de Liquidación
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="outline" onClick={onPrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}><X size={24} /></button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '2rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#fff', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eaeaea', paddingBottom: '20px', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', color: 'var(--bg-primary)' }}>LIQUIDACIÓN DE {data.tipo}</h1>
                                <h2 style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#666' }}>TAG Logística S.A.</h2>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '14px' }}>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Fecha Emisión:</strong> {formatDate(data.fecha_emision)}</p>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Liquidación Nro:</strong> <span style={{ fontFamily: 'monospace' }}>{data.numero}</span></p>
                                <p style={{ margin: 0 }}><strong>{data.tipo === 'cliente' ? 'Cliente' : 'Proveedor'}:</strong> {getEntityName(data)}</p>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '30px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Fecha</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Código</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Origen - Destino</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Chofer / Unidad</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555' }}>Gastos</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555' }}>Anticipos</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555' }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viajes.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px 8px' }}>{formatDate(v.fecha_salida)}</td>
                                        <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{getViajeCodigo(v)}</td>
                                        <td style={{ padding: '10px 8px' }}>{v.origen} → {v.destino}</td>
                                        <td style={{ padding: '10px 8px' }}>{v.chofer?.nombre} {v.chofer?.apellido} <span style={{ color: '#888', fontSize: '11px', display: 'block' }}>{v.unidad?.patente}</span></td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatCurrency(v.total_gastos)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatCurrency(v.total_anticipos)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(v.pivot?.monto ?? v.precio_pactado)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                    <td colSpan="6" style={{ padding: '20px 8px 10px', textAlign: 'right', borderTop: '2px solid #ddd' }}>TOTAL A LIQUIDAR:</td>
                                    <td style={{ padding: '20px 8px 10px', textAlign: 'right', borderTop: '2px solid #ddd', color: 'var(--bg-primary)' }}>{formatCurrency(data.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// CONFIRM DIALOG COMPONENT
// ============================================================
const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(2px)' }}>
        <div className="card" style={{ width: '400px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="outline" onClick={onCancel}>Cancelar</button>
                <button onClick={onConfirm} style={{ backgroundColor: '#dc2626', color: '#fff' }}>Confirmar</button>
            </div>
        </div>
    </div>
);

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
const Settlements = () => {
    const [activeTab, setActiveTab] = useState('proveedores');
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const [liquidaciones, setLiquidaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showWizard, setShowWizard] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [printMode, setPrintMode] = useState(false);
    const [dataToPrint, setDataToPrint] = useState(null);

    const [confirmAction, setConfirmAction] = useState(null);

    const fetchLiquidaciones = async () => {
        setLoading(true);
        try {
            const tipo = activeTab === 'clientes' ? 'cliente' : 'proveedor';
            const params = new URLSearchParams({ tipo });
            if (showArchived) params.set('archivados', 'true');

            const res = await fetch(`${API_BASE_URL}/liquidaciones?${params.toString()}`);
            if (!res.ok) throw new Error('Error al cargar liquidaciones');
            const data = await res.json();
            setLiquidaciones(data);
        } catch (err) {
            console.error(err);
            setLiquidaciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiquidaciones();
    }, [activeTab, showArchived]);

    useEffect(() => {
        if (printMode) {
            const t = setTimeout(() => { window.print(); }, 300);
            const handleAfterPrint = () => { setPrintMode(false); setDataToPrint(null); };
            window.addEventListener('afterprint', handleAfterPrint);
            return () => { clearTimeout(t); window.removeEventListener('afterprint', handleAfterPrint); };
        }
    }, [printMode]);

    const handleSaveWizard = (nuevaLiq) => {
        setShowWizard(false);
        fetchLiquidaciones();
        setPreviewData(nuevaLiq);
    };

    const handlePrint = (liq) => {
        setDataToPrint(liq);
        setPrintMode(true);
    };

    const handleArchive = (liq) => {
        setConfirmAction({
            title: 'Archivar Liquidación',
            message: `¿Está seguro de archivar la liquidación ${liq.numero}? Podrá restaurarla más tarde.`,
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/liquidaciones/${liq.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Error al archivar');
                    setConfirmAction(null);
                    fetchLiquidaciones();
                } catch (err) {
                    console.error(err);
                    setConfirmAction(null);
                }
            }
        });
    };

    const handleRestore = (liq) => {
        setConfirmAction({
            title: 'Restaurar Liquidación',
            message: `¿Está seguro de restaurar la liquidación ${liq.numero}?`,
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/liquidaciones/${liq.id}/restore`, { method: 'POST' });
                    if (!res.ok) throw new Error('Error al restaurar');
                    setConfirmAction(null);
                    fetchLiquidaciones();
                } catch (err) {
                    console.error(err);
                    setConfirmAction(null);
                }
            }
        });
    };

    const handleChangeEstado = (liq, nuevoEstado) => {
        const labels = { pendiente: 'Pendiente', facturada: 'Facturada', borrador: 'Borrador' };
        setConfirmAction({
            title: `Cambiar estado a "${labels[nuevoEstado]}"`,
            message: `¿Está seguro de cambiar el estado de la liquidación ${liq.numero} a ${labels[nuevoEstado]}?`,
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/liquidaciones/${liq.id}/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: nuevoEstado }),
                    });
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.message || 'Error al cambiar estado');
                    }
                    setConfirmAction(null);
                    fetchLiquidaciones();
                } catch (err) {
                    console.error(err);
                    setConfirmAction(null);
                }
            }
        });
    };

    const liqFiltradas = liquidaciones.filter(l => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const entityName = getEntityName(l).toLowerCase();
        const numero = (l.numero || '').toLowerCase();
        return entityName.includes(q) || numero.includes(q);
    });

    const getSiguienteEstado = (estado) => {
        if (estado === 'borrador') return 'pendiente';
        if (estado === 'pendiente') return 'facturada';
        return null;
    };

    const getEstadoLabel = (estado) => {
        if (estado === 'borrador') return 'Pendiente';
        if (estado === 'pendiente') return 'Facturada';
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                        Liquidaciones
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Historial y generación de liquidaciones de viajes.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 4px 6px -1px rgb(var(--bg-primary-rgb) / 0.2)',
                            marginTop: 'auto'
                        }}
                        onClick={() => setShowWizard(true)}
                    >
                        <Plus size={18} /> Nueva Liquidación
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-body)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                    <button
                        className={activeTab === 'proveedores' ? '' : 'outline'}
                        style={{ border: 'none', background: activeTab === 'proveedores' ? 'white' : 'transparent', color: activeTab === 'proveedores' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'proveedores' ? 'var(--shadow-sm)' : 'none' }}
                        onClick={() => setActiveTab('proveedores')}
                    >
                        <Briefcase size={16} style={{ marginRight: '0.5rem' }} /> Proveedores
                    </button>
                    <button
                        className={activeTab === 'clientes' ? '' : 'outline'}
                        style={{ border: 'none', background: activeTab === 'clientes' ? 'white' : 'transparent', color: activeTab === 'clientes' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: activeTab === 'clientes' ? 'var(--shadow-sm)' : 'none' }}
                        onClick={() => setActiveTab('clientes')}
                    >
                        <Users size={16} style={{ marginRight: '0.5rem' }} /> Clientes
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder={`Buscar por entidad, fecha o número...`}
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                    <input type="checkbox" id="showArchived" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} style={{ cursor: 'pointer' }} />
                    <label htmlFor="showArchived" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Ver Archivados</label>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', flex: 1 }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando liquidaciones...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="datatable">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>N° Liquidación</th>
                                    <th>{activeTab === 'clientes' ? 'Cliente' : 'Proveedor'}</th>
                                    <th style={{ textAlign: 'center' }}>Cant. Viajes</th>
                                    <th style={{ textAlign: 'right' }}>Monto Total</th>
                                    <th style={{ textAlign: 'center' }}>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liqFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                <FileText size={48} style={{ opacity: 0.3 }} />
                                                <p>No hay liquidaciones registradas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    liqFiltradas.map((liq) => {
                                        const isArchived = !!liq.deleted_at;
                                        const siguiente = getSiguienteEstado(liq.estado);
                                        return (
                                            <tr key={liq.id} className="table-row-hover" style={isArchived ? { opacity: 0.5 } : {}}>
                                                <td>{formatDate(liq.fecha_emision)}</td>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{liq.numero}</td>
                                                <td>{getEntityName(liq)}</td>
                                                <td style={{ textAlign: 'center' }}>{liq.viajes?.length || 0}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(liq.total)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="badge" style={{ textTransform: 'uppercase' }}>
                                                        {isArchived ? 'Archivada' : liq.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                        <button className="outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => setPreviewData(liq)} title="Ver Previsualización">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => handlePrint(liq)} title="Imprimir">
                                                            <Printer size={16} />
                                                        </button>
                                                        {!isArchived && siguiente && (
                                                            <button className="outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--color-success-text, #16a34a)' }} onClick={() => handleChangeEstado(liq, siguiente)} title={`Marcar como ${getEstadoLabel(liq.estado)}`}>
                                                                <CheckSquare size={16} />
                                                            </button>
                                                        )}
                                                        {!isArchived ? (
                                                            <button className="outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => handleArchive(liq)} title="Archivar">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        ) : (
                                                            <button className="outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--color-info-text, #2563eb)' }} onClick={() => handleRestore(liq)} title="Restaurar">
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showWizard && (
                <LiquidacionWizard
                    onClose={() => setShowWizard(false)}
                    onSave={handleSaveWizard}
                />
            )}

            {previewData && !printMode && (
                <LiquidacionPreview
                    data={previewData}
                    onClose={() => setPreviewData(null)}
                    onPrint={() => handlePrint(previewData)}
                />
            )}

            {printMode && dataToPrint && (
                <PrintPortal>
                    <PrintLiquidacionSheet data={dataToPrint} />
                </PrintPortal>
            )}

            {confirmAction && (
                <ConfirmDialog
                    title={confirmAction.title}
                    message={confirmAction.message}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    );
};

export default Settlements;
