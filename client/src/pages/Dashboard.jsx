import React from 'react';
import { mockTrips, mockClients, mockFleet, mockDocsAlerts } from '../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = ({ theme }) => {
  // Financial Data Processing
  const totalRevenue = mockTrips.reduce((acc, trip) => acc + (trip.revenue || 0), 0);
  const totalExpenses = mockTrips.reduce((acc, trip) => acc + (trip.expenses?.reduce((eAcc, e) => eAcc + e.amount, 0) || 0), 0);
  const netCashFlow = totalRevenue - totalExpenses;

  // Chart: Desglose de gastos
  const expMap = {};
  mockTrips.forEach(t => {
    if (t.expenses) {
      t.expenses.forEach(e => {
        if (!expMap[e.type]) expMap[e.type] = 0;
        expMap[e.type] += e.amount;
      });
    }
  });
  const expensesBreakdown = Object.keys(expMap).map(k => ({ name: k, value: expMap[k] }));

  // Chart: Rentabilidad por destino
  const destMap = {};
  mockTrips.forEach(t => {
    const margin = (t.revenue || 0) - (t.expenses?.reduce((a,e) => a+e.amount, 0) || 0);
    if (!destMap[t.destination]) destMap[t.destination] = 0;
    destMap[t.destination] += margin;
  });
  const destinationsProfit = Object.keys(destMap)
    .map(k => ({ name: k, margen: destMap[k] }))
    .sort((a,b) => b.margen - a.margen);

  // Chart: Estado de Viajes
  const statusMap = { 'Finalizado': 0, 'En curso': 0, 'Pendiente': 0, 'Cancelado': 0 };
  mockTrips.forEach(t => {
    if (statusMap[t.status] !== undefined) statusMap[t.status]++;
  });
  const tripsStatusData = Object.keys(statusMap)
    .filter(k => statusMap[k] > 0)
    .map(k => ({ name: k, value: statusMap[k] }));

  // Dynamic Theme Colors
  const isWarm = theme === 'warm';
  
  const PIE_COLORS = isWarm 
    ? ['#5c4e3f', '#70604e', '#877461', '#a08c76', '#baa68f', '#d0c0ad'] 
    : ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];
    
  const STATUS_COLORS = isWarm 
    ? { 'Finalizado': '#5c4e3f', 'En curso': '#70604e', 'Pendiente': '#a08c76', 'Cancelado': '#d0c0ad' }
    : { 'Finalizado': '#1e293b', 'En curso': '#334155', 'Pendiente': '#64748b', 'Cancelado': '#94a3b8' };
    
  const BAR_COLOR = isWarm ? '#5c4e3f' : '#1e293b';
  
  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  // Pie Chart Label Renderer for readability
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text 
        x={x} y={y} 
        fill="#ffffff" 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="12" 
        fontWeight="bold"
        stroke="#000000"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Financial KPIs */}
      <h2 style={{ fontSize: '1.25rem', margin: '0 0 -1rem' }}>Resumen Financiero y Operativo</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={16}/> Flujo de Caja (Neto)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: netCashFlow > 0 ? 'var(--color-success-text)' : 'inherit' }}>{formatCurrency(netCashFlow)}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Ingreso Bruto (Mes)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Gastos Operativos (Mes)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={16}/> Viajes Totales</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{mockTrips.length} procesados</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Profitability BarChart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Rentabilidad Neta por Destino</h3>
          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationsProfit} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v/1000}k`} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="margen" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses PieChart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Distribución de Gastos</h3>
          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {expensesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trips Status PieChart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Estado de Viajes</h3>
          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tripsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {tripsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--color-warning-text)" /> Panel de Riesgo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            {mockDocsAlerts.filter(a => a.daysLeft <= 15).map(alert => (
              <div key={alert.id} style={{ 
                padding: '1rem', 
                borderLeft: '4px solid var(--color-danger-text)',
                backgroundColor: 'var(--color-danger-bg)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-danger-text)' }}>{alert.entity}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-danger-text)' }}>
                  {alert.type} - Vence: {alert.expiration} ({alert.daysLeft} días)
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
