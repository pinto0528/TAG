import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, HardDrive, FileText, Receipt, Settings, Bell, Search, LogOut, Eye, EyeOff } from 'lucide-react';
import './App.css';

// Lazy loading pages or direct imports for PoC (direct for simplicity)
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Clients from './pages/Clients';
import Resources from './pages/Resources';
import Documentation from './pages/Documentation';
import Configuration from './pages/Configuration';
import Billing from './pages/Billing';
import Login from './pages/Login';

const Header = ({ onLogout, theme, toggleTheme }) => {
  const location = useLocation();
  const pathName = location.pathname.split('/')[1] || 'Dashboard';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <header className="top-header">
      <div className="header-title">
        {pathName.charAt(0).toUpperCase() + pathName.slice(1)}
      </div>
      <div className="header-actions">
        <button className="icon-button" title="Buscar"><Search size={20} /></button>
        <button className="icon-button" title="Modo Protección Visual" onClick={toggleTheme}>
          {theme === 'light' ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
        <button className="icon-button" title="Notificaciones"><Bell size={20} /></button>
        <div className="user-profile">
          <div className="avatar">A</div>
          <span>Admin</span>
        </div>
        <button className="icon-button" style={{ marginLeft: '1rem', color: 'var(--color-danger-text)' }} title="Cerrar Sesión" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={20} />
        </button>
      </div>
      </header>

      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '350px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Cerrar Sesión</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>¿Estás seguro de que deseas salir del sistema?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="outline" style={{ flex: 1 }} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
              <button style={{ flex: 1, backgroundColor: 'var(--color-danger-text)', color: '#fff' }} onClick={() => { setShowLogoutModal(false); onLogout(); }}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Navigation = () => {
  const navItems = [
    { path: '/trips', label: 'Viajes', icon: Truck },
  ];

  return (
    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          className={({ isActive }) => `nav-item ${isActive && (item.path !== '/' || window.location.pathname === '/') ? 'active' : ''}`}
          end={item.path === '/'}
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'warm' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            TAG Logística
          </div>
          <Navigation />
        </aside>
        
        <main className="main-content">
          <Header onLogout={() => setIsAuthenticated(false)} theme={theme} toggleTheme={toggleTheme} />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Navigate to="/trips" replace />} />
              <Route path="/dashboard" element={<Dashboard theme={theme} />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/config" element={<Configuration />} />
              <Route path="*" element={<Navigate to="/trips" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
