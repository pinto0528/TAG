// ============================================================
// Mock Data - Refleja la estructura del backend Laravel
// ============================================================

export const mockProveedores = [
  { id: 1, razon_social: 'Acme Corp', cuit: '30-12345678-9', direccion: 'Av. Corrientes 1234, CABA', telefono: '11-4444-5555', email: 'logistica@acme.com', contacto: 'Juan Perez' },
  { id: 2, razon_social: 'Logistica Sur SRL', cuit: '30-98765432-1', direccion: 'Ruta 3 KM 45, Buenos Aires', telefono: '11-3333-2222', email: 'ops@logsur.com', contacto: 'Maria Lopez' },
  { id: 3, razon_social: 'AgroExport SA', cuit: '33-44556677-9', direccion: 'Puerto Rosario, Santa Fe', telefono: '341-555-1234', email: 'despacho@agroexport.com', contacto: 'Carlos Diaz' },
  { id: 4, razon_social: 'Distribuidora del Norte', cuit: '30-11223344-5', direccion: 'Av. Perón 500, Tucumán', telefono: '381-444-0000', email: 'admin@distnorte.com', contacto: 'Ana Gomez' },
];

export const mockChoferes = [
  { id: 1, nombre: 'Miguel Angel', apellido: 'Paz', dni: '30555111', telefono: '11-5555-1111', licencia_vencimiento: '2026-10-15', linti_vencimiento: '2026-11-20', activo: true },
  { id: 2, nombre: 'Roberto', apellido: 'Suarez', dni: '28444222', telefono: '11-5555-2222', licencia_vencimiento: '2026-04-05', linti_vencimiento: '2026-05-10', activo: true },
  { id: 3, nombre: 'Fernando', apellido: 'Ruiz', dni: '33666333', telefono: '11-5555-3333', licencia_vencimiento: '2026-04-02', linti_vencimiento: '2027-01-15', activo: true },
  { id: 4, nombre: 'Hector', apellido: 'Gimenez', dni: '27777444', telefono: '11-5555-4444', licencia_vencimiento: '2027-06-20', linti_vencimiento: '2026-08-30', activo: true },
];

export const mockUnidades = [
  { id: 1, patente: 'AB123CD', marca: 'Scania', modelo: 'R450', tipo: 'Camión', numero_interno: 'U-01', vtv_vencimiento: '2026-12-01', seguro_vencimiento: '2026-07-15', activo: true },
  { id: 2, patente: 'AA000BB', marca: 'Mercedes-Benz', modelo: 'Actros', tipo: 'Camión', numero_interno: 'U-02', vtv_vencimiento: '2026-05-20', seguro_vencimiento: '2026-04-01', activo: true },
  { id: 3, patente: 'AD456EF', marca: 'Volvo', modelo: 'FH 460', tipo: 'Camión', numero_interno: 'U-03', vtv_vencimiento: '2026-10-10', seguro_vencimiento: '2027-01-01', activo: true },
  { id: 4, patente: 'AC789GH', marca: 'Randon', modelo: 'Semirremolque', tipo: 'Acoplado', numero_interno: 'A-01', vtv_vencimiento: '2026-08-11', seguro_vencimiento: '2026-09-05', activo: true },
];

export const mockFleteros = [
  { id: 1, razon_social: 'Transportes Gómez', cuit: '20-33445566-7', telefono: '11-6666-7777', contacto: 'Raul Gómez' },
  { id: 2, razon_social: 'Fletes del Litoral', cuit: '20-99887766-5', telefono: '342-555-8888', contacto: 'Lucas Fernández' },
];

// Estados: pendiente, en_curso, finalizado, cancelado
export const mockViajes = [
  {
    id: 1,
    unidad_id: 1, chofer_id: 1, proveedor_id: 1, fletero_id: null,
    estado: 'en_curso',
    origen: 'CABA', destino: 'Rosario',
    fecha_salida: '2026-04-05', hora_salida: '06:30',
    fecha_llegada: null, hora_llegada: null,
    precio: 850000, observaciones: 'Carga frágil, manejar con cuidado.',
    carga: { descripcion: 'Electrodomésticos', tipo_carga: 'General', peso_kg: 12000, cantidad_bultos: 45, requiere_refrigeracion: false },
    anticipos: [
      { id: 1, concepto: 'Adelanto combustible', monto: 100000, fecha: '2026-04-04', metodo_pago: 'Transferencia' },
    ],
    gastos: [
      { id: 1, tipo: 'Combustible', concepto: 'Carga completa YPF Dock Sud', monto: 200000, fecha: '2026-04-05' },
      { id: 2, tipo: 'Peajes', concepto: 'Autopista Bs As - Rosario', monto: 15000, fecha: '2026-04-05' },
      { id: 3, tipo: 'Viáticos', concepto: 'Almuerzo chofer', monto: 25000, fecha: '2026-04-05' },
    ],
    remitos: [
      { id: 1, numero: 'R-0001-00089221', fecha: '2026-04-05', descripcion: 'Entrega parcial lote 1', estado: 'conforme', factura_id: 1 },
      { id: 2, numero: 'R-0001-00089222', fecha: '2026-04-05', descripcion: 'Entrega parcial lote 2', estado: 'pendiente', factura_id: 1 },
    ],
  },
  {
    id: 2,
    unidad_id: 3, chofer_id: 3, proveedor_id: 3, fletero_id: null,
    estado: 'en_curso',
    origen: 'Rosario', destino: 'Córdoba',
    fecha_salida: '2026-04-04', hora_salida: '08:00',
    fecha_llegada: null, hora_llegada: null,
    precio: 600000, observaciones: '',
    carga: { descripcion: 'Cereales a granel', tipo_carga: 'Granel', peso_kg: 28000, cantidad_bultos: null, requiere_refrigeracion: false },
    anticipos: [],
    gastos: [
      { id: 4, tipo: 'Combustible', concepto: 'Carga Shell Rosario', monto: 120000, fecha: '2026-04-04' },
      { id: 5, tipo: 'Peajes', concepto: 'Autopista Rosario-Córdoba', monto: 8000, fecha: '2026-04-04' },
    ],
    remitos: [
      { id: 3, numero: 'R-0003-00055001', fecha: '2026-04-04', descripcion: 'Despacho granel completo', estado: 'pendiente', factura_id: null },
    ],
  },
  {
    id: 3,
    unidad_id: 2, chofer_id: 2, proveedor_id: 2, fletero_id: null,
    estado: 'finalizado',
    origen: 'Bahía Blanca', destino: 'CABA',
    fecha_salida: '2026-03-25', hora_salida: '05:00',
    fecha_llegada: '2026-03-27', hora_llegada: '14:30',
    precio: 1200000, observaciones: 'Entrega sin novedades.',
    carga: { descripcion: 'Materiales de construcción', tipo_carga: 'Pesada', peso_kg: 22000, cantidad_bultos: 120, requiere_refrigeracion: false },
    anticipos: [
      { id: 2, concepto: 'Anticipo viaje', monto: 200000, fecha: '2026-03-24', metodo_pago: 'Efectivo' },
    ],
    gastos: [
      { id: 6, tipo: 'Combustible', concepto: 'Carga completa', monto: 250000, fecha: '2026-03-25' },
      { id: 7, tipo: 'Peajes', concepto: 'Autopista completa', monto: 30000, fecha: '2026-03-25' },
      { id: 8, tipo: 'Mantenimiento', concepto: 'Cambio de filtro de aire', monto: 50000, fecha: '2026-03-26' },
    ],
    remitos: [
      { id: 4, numero: 'R-0002-00044010', fecha: '2026-03-27', descripcion: 'Entrega completa', estado: 'conforme', factura_id: 2 },
    ],
  },
  {
    id: 4,
    unidad_id: 1, chofer_id: null, proveedor_id: 4, fletero_id: 1,
    estado: 'pendiente',
    origen: 'Tucumán', destino: 'Salta',
    fecha_salida: '2026-04-10', hora_salida: null,
    fecha_llegada: null, hora_llegada: null,
    precio: 450000, observaciones: 'Esperando asignación de chofer. Fletero confirmado.',
    carga: null,
    anticipos: [],
    gastos: [],
    remitos: [],
  },
  {
    id: 5,
    unidad_id: 1, chofer_id: 1, proveedor_id: 1, fletero_id: null,
    estado: 'finalizado',
    origen: 'Mar del Plata', destino: 'CABA',
    fecha_salida: '2026-03-10', hora_salida: '07:00',
    fecha_llegada: '2026-03-11', hora_llegada: '16:00',
    precio: 950000, observaciones: '',
    carga: { descripcion: 'Productos pesqueros', tipo_carga: 'Refrigerada', peso_kg: 15000, cantidad_bultos: 80, requiere_refrigeracion: true },
    anticipos: [],
    gastos: [
      { id: 9, tipo: 'Combustible', concepto: 'Carga completa', monto: 180000, fecha: '2026-03-10' },
      { id: 10, tipo: 'Peajes', concepto: 'Ruta 2', monto: 20000, fecha: '2026-03-10' },
      { id: 11, tipo: 'Viáticos', concepto: 'Cena y desayuno', monto: 30000, fecha: '2026-03-10' },
    ],
    remitos: [
      { id: 5, numero: 'R-0001-00089200', fecha: '2026-03-11', descripcion: 'Entrega total', estado: 'conforme', factura_id: 3 },
    ],
  },
];

export const mockFacturas = [
  { id: 1, numero: 'FC-A-0001-00004561', tipo: 'A', fecha_emision: '2026-04-05', monto_neto: 702479, iva: 147521, monto_total: 850000, estado: 'pendiente' },
  { id: 2, numero: 'FC-A-0001-00004562', tipo: 'A', fecha_emision: '2026-03-28', monto_neto: 991736, iva: 208264, monto_total: 1200000, estado: 'pagada' },
  { id: 3, numero: 'FC-A-0001-00004563', tipo: 'A', fecha_emision: '2026-03-12', monto_neto: 785124, iva: 164876, monto_total: 950000, estado: 'pagada' },
];

export const mockDocsAlerts = [
  { id: 1, type: 'Licencia de Conducir', entity: 'Fernando Ruiz', expiration: '2026-04-02', daysLeft: 2, severity: 'danger' },
  { id: 2, type: 'Seguro (Camión)', entity: 'Mercedes-Benz (AA000BB)', expiration: '2026-04-01', daysLeft: 1, severity: 'danger' },
  { id: 3, type: 'LINTI', entity: 'Roberto Suarez', expiration: '2026-05-10', daysLeft: 40, severity: 'warning' },
];
