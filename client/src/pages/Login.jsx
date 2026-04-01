import React, { useState } from 'react';
import { Truck } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock PoC: cualquier par de datos ingresados entra.
    if (username && password) {
      onLogin();
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-invert)', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <Truck size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>TAG Logística</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.875rem', textAlign: 'center' }}>Plataforma Integral de Flota</p>
        
        <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Usuario</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. admin" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '1rem' }}>Ingresar al Sistema</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
