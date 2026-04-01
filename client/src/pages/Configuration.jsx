import React from 'react';
import { User, MapPin, Package, Shield } from 'lucide-react';

const Configuration = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Configuración del Sistema</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Module 1: Usuarios */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ background: 'var(--bg-body)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--bg-primary)' }}>
              <User size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Usuarios del Sistema</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Administre accesos para personal de oficina y choferes. (Demo)
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="outline" style={{ flex: 1 }}>Ver Usuarios</button>
            <button style={{ flex: 1 }}>Crear Usuario</button>
          </div>
        </div>

        {/* Module 2: Localidades */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ background: 'var(--bg-body)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--bg-primary)' }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Localidades y Rutas</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Gestión de zonas frecuentes y distancias predefinidas.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="outline" style={{ flex: 1 }}>Gestionar</button>
          </div>
        </div>

        {/* Module 3: Tipos de Carga */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ background: 'var(--bg-body)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--bg-primary)' }}>
              <Package size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Tipos de Carga / Tarifas</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Configuración de nomencladores y unidades de medida.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="outline" style={{ flex: 1 }}>Gestionar</button>
          </div>
        </div>
        
        {/* Module 4: Seguridad */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ background: 'var(--color-danger-bg)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--color-danger-text)' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Auditoría y Backups</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Registro de actividades y copia de seguridad de la base de datos.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="outline" style={{ flex: 1 }}>Ver Logs</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Configuration;
