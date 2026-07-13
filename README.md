# TAG Logistica - Sistema de Gestión Integral

**TAG Logistica** es una plataforma disenada para centralizar y optimizar la operativa diaria de empresas de transporte y logistica. El sistema permite gestionar desde la asignacion de recursos hasta la trazabilidad documental y financiera de cada viaje.

---

## Modulos Principales

### 1. Viajes (Modulo Central)
El corazon del sistema. Ciclo de vida completo con 5 estados:
*   **Pendiente → En Curso → Finalizado → Liquidado**
*   **Cancelado** (desde pendiente o en curso)
*   Asignacion de recursos (choferes y unidades, propios o tercerizados)
*   Sistema de tarifa flexible (por km, bulto, tonelada, tarifa plana)
*   Gestion de cargas
*   **Documento asociado (1:1)**: REMITO, CARTA_DE_PORTE o HOJA_DE_RUTA
*   Hoja de ruta imprimible (A4)

### 2. Administracion de Recursos
*   **Unidades**: Camiones y acoplados, seguimiento VTV/Seguros
*   **Choferes**: Legajos, contactos, control LINTI
*   **Proveedores (Fleteros)**: Transporte tercerizado

### 3. Liquidaciones
Agrupacion de viajes para cobrar al cliente o pagar al proveedor:
*   Wizard de creacion con filtros dinamicos
*   Numeracion automatica: LIQ-C-XXXX (clientes), LIQ-P-XXXX (proveedores)
*   Estados: borrador → pendiente → facturada
*   Agregar/quitar viajes, actualizar montos, calcular total

### 4. Facturacion
*   Facturas generadas a partir de liquidaciones
*   CRUD completo (mock por ahora)

### 5. Documentacion e Impresion
*   Hojas de ruta imprimibles
*   Documentos por viaje (REMITO, CARTA_DE_PORTE, HOJA_DE_RUTA)

---

## Flujo de Negocio

```
Viaje → Documento → Liquidacion → Factura
         (1:1)        (N:N)         (1:1)
```

---

## Stack Tecnologico

*   **Frontend**: React 19 + Vite 8, React Router DOM 7, Recharts, Lucide React
*   **Backend**: Laravel 13, PHP 8.4
*   **Base de datos**: SQLite (desarrollo), MySQL (produccion)
*   **Auth**: Laravel Sanctum

---

## Inicio Rapido (Desarrollo)

```bash
# Backend
cd api
php artisan migrate:fresh --seed
php artisan serve

# Frontend
cd client
npm install
npm run dev
```

O usar los scripts `.bat` en la raiz del proyecto:
- `iniciar-backend.bat`
- `iniciar-frontend.bat`
- `reset-db.bat`

---

## Produccion

**URL:** `http://logisticatag.com.ar`

Ver `DEPLOYMENT_GUIDE.md` para instrucciones de despliegue.
