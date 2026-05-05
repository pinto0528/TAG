import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, FileText, Printer, Users, Briefcase, Eye, X, ChevronRight, ChevronLeft, CheckSquare, Square } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-AR');
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

const PrintLiquidacionSheet = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* Forzar Landscape para esta impresión */}
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
                    <p style={{ margin: '0 0 5px 0' }}><strong>Liquidación Nro:</strong> {data.codigo}</p>
                    <p style={{ margin: 0 }}><strong>{data.tipo === 'cliente' ? 'Cliente' : 'Proveedor'}:</strong> {data.entidadNombre}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Código</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Origen</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Destino</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Chofer</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Unidad</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {data.viajes.map((v, i) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{formatDate(v.fecha)}</td>
                            <td style={{ padding: '8px' }}>VIA-{v.id.toString().padStart(4, '0')}</td>
                            <td style={{ padding: '8px' }}>{v.origen}</td>
                            <td style={{ padding: '8px' }}>{v.destino}</td>
                            <td style={{ padding: '8px' }}>{v.chofer}</td>
                            <td style={{ padding: '8px' }}>{v.unidad}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(v.monto)}</td>
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
    const [filtrosActivos, setFiltrosActivos] = useState({ fecha: false, origen: false, destino: false });
    const [filtros, setFiltros] = useState({ desde: '', hasta: '', origen: '', destino: '' });
    
    const [viajesDisponibles, setViajesDisponibles] = useState([]);
    const [viajesSeleccionados, setViajesSeleccionados] = useState([]);

    // MOCK DATA PARA LA UI
    const mockEntidades = {
        clientes: [{ id: 1, nombre: 'Arcor S.A.' }, { id: 2, nombre: 'Molinos Río de la Plata' }],
        proveedores: [{ id: 1, nombre: 'Transportes El Rápido' }, { id: 2, nombre: 'Juan Pérez (Fletero)' }]
    };

    const mockViajes = [
        { id: 101, fecha: '2026-05-01', origen: 'Buenos Aires', destino: 'Rosario', chofer: 'Carlos Ruiz', unidad: 'AB 123 CD', monto: 150000 },
        { id: 102, fecha: '2026-05-03', origen: 'Rosario', destino: 'Córdoba', chofer: 'Luis Sosa', unidad: 'EF 456 GH', monto: 200000 },
        { id: 103, fecha: '2026-05-05', origen: 'Córdoba', destino: 'Mendoza', chofer: 'Mario Bross', unidad: 'IJ 789 KL', monto: 350000 },
    ];

    const handleSearch = () => {
        // En una app real, aquí haríamos el fetch con los filtros
        setViajesDisponibles(mockViajes);
        setViajesSeleccionados(mockViajes.map(v => v.id)); // Por defecto seleccionamos todos
        setStep(2);
    };

    const toggleSelection = (id) => {
        if (viajesSeleccionados.includes(id)) {
            setViajesSeleccionados(prev => prev.filter(vId => vId !== id));
        } else {
            setViajesSeleccionados(prev => [...prev, id]);
        }
    };

    const handleGenerate = () => {
        const viajesElegidos = viajesDisponibles.filter(v => viajesSeleccionados.includes(v.id));
        const total = viajesElegidos.reduce((acc, v) => acc + v.monto, 0);
        const entidad = mockEntidades[tipo === 'cliente' ? 'clientes' : 'proveedores'].find(e => e.id === parseInt(entidadId));
        
        const nuevaLiq = {
            id: Date.now(),
            codigo: `LIQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            fecha_emision: new Date().toISOString(),
            tipo,
            entidadNombre: entidad ? entidad.nombre : 'Desconocido',
            viajes: viajesElegidos,
            total,
            estado: 'borrador'
        };
        onSave(nuevaLiq);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Nueva Liquidación</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paso {step} de 2: {step === 1 ? 'Parámetros de búsqueda' : 'Selección de viajes'}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Liquidación</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tipo" checked={tipo === 'proveedor'} onChange={() => setTipo('proveedor')} /> Proveedor / Fletero
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="radio" name="tipo" checked={tipo === 'cliente'} onChange={() => setTipo('cliente')} /> Cliente / Generador
                                    </label>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Entidad a Liquidar</label>
                                <select className="input-field" value={entidadId} onChange={e => setEntidadId(e.target.value)}>
                                    <option value="">Seleccione...</option>
                                    {mockEntidades[tipo === 'cliente' ? 'clientes' : 'proveedores'].map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', margin: 0 }}>Filtros de Búsqueda</h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!filtrosActivos.fecha && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({...prev, fecha: true}))}>+ Fecha</button>}
                                    {!filtrosActivos.origen && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({...prev, origen: true}))}>+ Origen</button>}
                                    {!filtrosActivos.destino && <button className="outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => setFiltrosActivos(prev => ({...prev, destino: true}))}>+ Destino</button>}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filtrosActivos.fecha && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Desde</label>
                                            <input type="date" className="input-field" value={filtros.desde} onChange={e => setFiltros(prev => ({...prev, desde: e.target.value}))} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hasta</label>
                                            <input type="date" className="input-field" value={filtros.hasta} onChange={e => setFiltros(prev => ({...prev, hasta: e.target.value}))} />
                                        </div>
                                        <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)' }} onClick={() => setFiltrosActivos(prev => ({...prev, fecha: false}))}><X size={16} /></button>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {filtrosActivos.origen && (
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Origen</label>
                                                <input type="text" className="input-field" placeholder="Ej: Buenos Aires" value={filtros.origen} onChange={e => setFiltros(prev => ({...prev, origen: e.target.value}))} />
                                            </div>
                                            <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)', marginTop: '1.2rem' }} onClick={() => setFiltrosActivos(prev => ({...prev, origen: false}))}><X size={16} /></button>
                                        </div>
                                    )}
                                    {filtrosActivos.destino && (
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Destino</label>
                                                <input type="text" className="input-field" placeholder="Ej: Rosario" value={filtros.destino} onChange={e => setFiltros(prev => ({...prev, destino: e.target.value}))} />
                                            </div>
                                            <button className="outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger-text)', marginTop: '1.2rem' }} onClick={() => setFiltrosActivos(prev => ({...prev, destino: false}))}><X size={16} /></button>
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
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={!entidadId} onClick={handleSearch}>
                                Buscar Viajes <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                            Seleccione los viajes que desea incluir en esta liquidación.
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
                                        <th style={{ textAlign: 'right' }}>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viajesDisponibles.map(v => (
                                        <tr key={v.id} style={{ cursor: 'pointer', backgroundColor: viajesSeleccionados.includes(v.id) ? 'var(--bg-hover)' : 'transparent' }} onClick={() => toggleSelection(v.id)}>
                                            <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={viajesSeleccionados.includes(v.id)} onChange={() => toggleSelection(v.id)} />
                                            </td>
                                            <td>{formatDate(v.fecha)}</td>
                                            <td>{v.origen} → {v.destino}</td>
                                            <td><span style={{ display: 'block', fontSize: '0.85rem' }}>{v.chofer}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.unidad}</span></td>
                                            <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(v.monto)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <button className="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setStep(1)}>
                                <ChevronLeft size={18} /> Atrás
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Seleccionado ({viajesSeleccionados.length})</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--bg-primary)' }}>
                                        {formatCurrency(viajesDisponibles.filter(v => viajesSeleccionados.includes(v.id)).reduce((acc, v) => acc + v.monto, 0))}
                                    </span>
                                </div>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={viajesSeleccionados.length === 0} onClick={handleGenerate}>
                                    Generar Liquidación
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

                {/* Contenedor escrolleable con el preview visual (simulando A4/Carta horizontal en UI) */}
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '2rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#fff', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eaeaea', paddingBottom: '20px', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', textTransform: 'uppercase', color: 'var(--bg-primary)' }}>LIQUIDACIÓN DE {data.tipo}</h1>
                                <h2 style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#666' }}>TAG Logística S.A.</h2>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '14px' }}>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Fecha Emisión:</strong> {formatDate(data.fecha_emision)}</p>
                                <p style={{ margin: '0 0 5px 0' }}><strong>Liquidación Nro:</strong> <span style={{ fontFamily: 'monospace' }}>{data.codigo}</span></p>
                                <p style={{ margin: 0 }}><strong>{data.tipo === 'cliente' ? 'Cliente' : 'Proveedor'}:</strong> {data.entidadNombre}</p>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '30px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Fecha</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Código</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Origen - Destino</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#555' }}>Chofer / Unidad</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', color: '#555' }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.viajes.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px 8px' }}>{formatDate(v.fecha)}</td>
                                        <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>VIA-{v.id.toString().padStart(4, '0')}</td>
                                        <td style={{ padding: '10px 8px' }}>{v.origen} → {v.destino}</td>
                                        <td style={{ padding: '10px 8px' }}>{v.chofer} <span style={{ color: '#888', fontSize: '11px', display: 'block' }}>{v.unidad}</span></td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(v.monto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                    <td colSpan="4" style={{ padding: '20px 8px 10px', textAlign: 'right', borderTop: '2px solid #ddd' }}>TOTAL A LIQUIDAR:</td>
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
// MAIN PAGE COMPONENT
// ============================================================
const Liquidaciones = () => {
    const [activeTab, setActiveTab] = useState('proveedores'); // 'proveedores' or 'clientes'
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    
    // UI State
    const [liquidaciones, setLiquidaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modals state
    const [showWizard, setShowWizard] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [printMode, setPrintMode] = useState(false);
    const [dataToPrint, setDataToPrint] = useState(null);

    // MOCK data fetching
    const fetchData = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, searchQuery, showArchived]);

    // Lógica para imprimir
    useEffect(() => {
        if (printMode) {
            const t = setTimeout(() => { window.print(); }, 300);
            const handleAfterPrint = () => { setPrintMode(false); setDataToPrint(null); };
            window.addEventListener('afterprint', handleAfterPrint);
            return () => { clearTimeout(t); window.removeEventListener('afterprint', handleAfterPrint); };
        }
    }, [printMode]);

    const handleSaveWizard = (nuevaLiq) => {
        // En UI, guardamos y abrimos la previsualización directamente
        setLiquidaciones(prev => [nuevaLiq, ...prev]);
        setShowWizard(false);
        setPreviewData(nuevaLiq);
    };

    const handlePrint = (liq) => {
        setDataToPrint(liq);
        setPrintMode(true);
    };

    const liqFiltradas = liquidaciones.filter(l => l.tipo === (activeTab === 'clientes' ? 'cliente' : 'proveedor'));

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

            {/* Filtros y Tabs */}
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

            {/* Tabla Principal */}
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
                                    liqFiltradas.map((liq) => (
                                        <tr key={liq.id} className="table-row-hover">
                                            <td>{formatDate(liq.fecha_emision)}</td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{liq.codigo}</td>
                                            <td>{liq.entidadNombre}</td>
                                            <td style={{ textAlign: 'center' }}>{liq.viajes.length}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(liq.total)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge" style={{ textTransform: 'uppercase' }}>{liq.estado}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => setPreviewData(liq)} title="Ver Previsualización">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="outline" style={{ padding: '0.4rem', border: 'none' }} onClick={() => handlePrint(liq)} title="Imprimir Directo">
                                                        <Printer size={16} />
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

            {/* MODALS */}
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

            {/* PRINT PORTAL */}
            {printMode && dataToPrint && (
                <PrintPortal>
                    <PrintLiquidacionSheet data={dataToPrint} />
                </PrintPortal>
            )}
        </div>
    );
};

export default Liquidaciones;
