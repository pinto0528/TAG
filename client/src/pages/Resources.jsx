import React, { useState } from 'react';
import { mockChoferes as mockDrivers, mockUnidades as mockFleet } from '../data/mockData';
import { User, Truck, Plus } from 'lucide-react';

const Resources = () => {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'fleet'

  const getAssignedUnit = (unitId) => {
    if (!unitId) return 'Sin asignar';
    const unit = mockFleet.find(f => f.id === unitId);
    return unit ? `${unit.plate} - ${unit.brand}` : 'Desconocido';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Recursos</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> {activeTab === 'drivers' ? 'Agregar Chofer' : 'Agregar Unidad'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          className={activeTab === 'drivers' ? '' : 'outline'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('drivers')}
        >
          <User size={18} /> Personal / Choferes
        </button>
        <button 
          className={activeTab === 'fleet' ? '' : 'outline'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', flex: 1, justifyContent: 'center' }}
          onClick={() => setActiveTab('fleet')}
        >
          <Truck size={18} /> Flota (Camiones y Acoplados)
        </button>
      </div>

      {activeTab === 'drivers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {mockDrivers.map(driver => (
            <div key={driver.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: '#e2e8f0', borderRadius: '50%', padding: '1rem', color: 'var(--text-muted)' }}>
                <User size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{driver.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{driver.phone}</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                  <strong>Unidad Asignada:</strong><br />
                  {getAssignedUnit(driver.unitId)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'fleet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {mockFleet.map(unit => (
            <div key={unit.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: '#e2e8f0' }}>{unit.type}</span>
                <span className={`badge ${unit.status === 'Disponible' ? 'success' : 'info'}`}>{unit.status}</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{unit.plate}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{unit.brand} {unit.model}</p>
              </div>
              <div style={{ fontSize: '0.875rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>VTV:</span>
                  <strong>{unit.vtvExp}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Seguro:</span>
                  <strong>{unit.insuranceExp}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Resources;
