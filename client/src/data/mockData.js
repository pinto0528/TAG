export const mockClients = [
  { id: 1, name: "Acme Corp", cuit: "30-12345678-9", contact: "Juan Perez", phone: "11-4444-5555", address: "Av. Corrientes 1234, CABA" },
  { id: 2, name: "Logistica Sur", cuit: "30-98765432-1", contact: "Maria Lopez", phone: "11-3333-2222", address: "Ruta 3 KM 45, Buenos Aires" },
  { id: 3, name: "AgroExport SA", cuit: "33-44556677-9", contact: "Carlos Diaz", phone: "341-555-1234", address: "Puerto Rosario, Santa Fe" },
  { id: 4, name: "Distribuidora del Norte", cuit: "30-11223344-5", contact: "Ana Gomez", phone: "381-444-0000", address: "Av. Perón 500, Tucumán" },
];

export const mockDrivers = [
  { id: 1, name: "Miguel Angel Paz", phone: "11-5555-1111", licenseExp: "2026-10-15", lintiExp: "2026-11-20", unitId: 101 },
  { id: 2, name: "Roberto Suarez", phone: "11-5555-2222", licenseExp: "2026-04-05", lintiExp: "2026-05-10", unitId: 102 },
  { id: 3, name: "Fernando Ruiz", phone: "11-5555-3333", licenseExp: "2026-04-02", lintiExp: "2027-01-15", unitId: null },
  { id: 4, name: "Hector Gimenez", phone: "11-5555-4444", licenseExp: "2027-06-20", lintiExp: "2026-08-30", unitId: 103 },
];

export const mockFleet = [
  { id: 101, plate: "AB123CD", brand: "Scania", model: "R450", type: "Camión", vtvExp: "2026-12-01", insuranceExp: "2026-07-15", status: "En viaje" },
  { id: 102, plate: "AA000BB", brand: "Mercedes-Benz", model: "Actros", type: "Camión", vtvExp: "2026-05-20", insuranceExp: "2026-04-01", status: "Disponible" },
  { id: 103, plate: "AD456EF", brand: "Volvo", model: "FH 460", type: "Camión", vtvExp: "2026-10-10", insuranceExp: "2027-01-01", status: "En viaje" },
  { id: 201, plate: "AC789GH", brand: "Randon", model: "Semirremolque", type: "Acoplado", vtvExp: "2026-08-11", insuranceExp: "2026-09-05", status: "Disponible" },
];

// Statuses: "Pendiente", "En curso", "Finalizado", "Cancelado"
export const mockTrips = [
  { id: "TRP-1001", clientId: 1, driverId: 1, unitId: 101, origin: "CABA", destination: "Rosario", status: "En curso", dateStart: "2026-03-30", dateEnd: "2026-03-31", revenue: 850000, expenses: [{ type: "Combustible", amount: 200000 }, { type: "Peajes", amount: 15000 }, { type: "Viáticos", amount: 25000 }] },
  { id: "TRP-1002", clientId: 3, driverId: 3, unitId: 103, origin: "Rosario", destination: "Córdoba", status: "En curso", dateStart: "2026-03-29", dateEnd: "2026-03-30", revenue: 600000, expenses: [{ type: "Combustible", amount: 120000 }, { type: "Peajes", amount: 8000 }] },
  { id: "TRP-1003", clientId: 2, driverId: 2, unitId: 102, origin: "Bahía Blanca", destination: "CABA", status: "Finalizado", dateStart: "2026-03-25", dateEnd: "2026-03-27", revenue: 1200000, expenses: [{ type: "Combustible", amount: 250000 }, { type: "Peajes", amount: 30000 }, { type: "Mantenimiento", amount: 50000 }] },
  { id: "TRP-1004", clientId: 4, driverId: 4, unitId: 101, origin: "Tucumán", destination: "Salta", status: "Pendiente", dateStart: "2026-04-02", dateEnd: "2026-04-03", revenue: 450000, expenses: [{ type: "Combustible", amount: 90000 }] },
  { id: "TRP-1005", clientId: 1, driverId: 1, unitId: 101, origin: "Mar del Plata", destination: "CABA", status: "Finalizado", dateStart: "2026-03-10", dateEnd: "2026-03-11", revenue: 950000, expenses: [{ type: "Combustible", amount: 180000 }, { type: "Peajes", amount: 20000 }, { type: "Viáticos", amount: 30000 }] },
];

export const mockDocsAlerts = [
  { id: 1, type: "Licencia de Conducir", entity: "Fernando Ruiz", expiration: "2026-04-02", daysLeft: 2, severity: "danger" },
  { id: 2, type: "Seguro (Camión)", entity: "Mercedes-Benz (AA000BB)", expiration: "2026-04-01", daysLeft: 1, severity: "danger" },
  { id: 3, type: "LINTI", entity: "Roberto Suarez", expiration: "2026-05-10", daysLeft: 40, severity: "warning" },
];

export const mockBilling = [
  { id: 1, type: "Factura", documentNumber: "FC-0001-00004561", tripId: "TRP-1001", file: "factura_acme.pdf", date: "2026-03-31", status: "Emitida" },
  { id: 2, type: "Remito", documentNumber: "R-0001-00089221", tripId: "TRP-1001", file: "remito_firmado.jpg", date: "2026-03-31", status: "Conforme" },
  { id: 3, type: "Carta de Porte", documentNumber: "CP-88776655", tripId: "TRP-1002", file: "cp_agroexport.pdf", date: "2026-03-29", status: "Pendiente" },
  { id: 4, type: "Hoja de Ruta", documentNumber: "HR-001021", tripId: "TRP-1003", file: "hoja_ruta_001.pdf", date: "2026-03-25", status: "Cerrada" },
];
