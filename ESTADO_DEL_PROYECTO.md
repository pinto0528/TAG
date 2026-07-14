# Estado del Proyecto - TAG Logistica

**Fecha del documento:** 13 de julio de 2026
**Entorno actual:** Desarrollo local (SQLite, PHP 8.4)

---

## 1. Resumen General

TAG Logistica es un sistema de gestion integral para empresas de transporte y logistica. Permite administrar clientes, proveedores, recursos (unidades/choferes), viajes, liquidaciones y documentacion desde una unica plataforma.

**Flujo de negocio:**
```
Viaje → Documento (REMITO | CARTA_DE_PORTE | HOJA_DE_RUTA)
  ↓ (se agrupan en liquidaciones)
Liquidacion → Factura
```

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend | React + Vite | React 19, Vite 8 |
| Backend | Laravel | 13 (PHP 8.4) |
| Base de datos (dev) | SQLite | — |
| Base de datos (prod) | MySQL | 8.0 |
| Auth | Laravel Sanctum | 4.x |
| UI Charts | Recharts | 3.8 |
| Icons | Lucide React | 1.7 |
| Router | React Router DOM | 7.13 |

**Entorno de desarrollo local:**
- PHP 8.4.23 en `C:\php84` (instalacion manual)
- Composer 2.10.2 en `~/composer.phar`
- Base de datos SQLite en `api/database/database.sqlite`
- Scripts `.bat` para iniciar backend/frontend

---

## 3. Estructura del Proyecto

```
TAG/
├── api/                         # Backend Laravel
│   ├── app/
│   │   ├── Enums/               # EstadoViaje (5 estados)
│   │   ├── Http/Controllers/    # 8 controladores
│   │   └── Models/              # 12 modelos Eloquent
│   ├── database/
│   │   ├── migrations/          # 31 migraciones
│   │   └── seeders/             # TestSeeder
│   ├── routes/api.php           # Rutas API
│   └── database.sqlite          # DB SQLite (dev)
├── client/                      # Frontend React
│   └── src/
│       ├── pages/               # 10 paginas
│       └── apiConfig.js
├── scratch/
│   └── 00-LOGICA-DE-DATOS.md    # Diseno de datos y plan
├── HISTORY.md                   # Registro de cambios
├── ESTADO_DEL_PROYECTO.md       # Este archivo
├── DEPLOYMENT_GUIDE.md          # Guia de despliegue
├── iniciar-backend.bat          # Atajo backend
├── iniciar-frontend.bat         # Atajo frontend
└── reset-db.bat                 # Reset DB + seed
```

---

## 4. Modulos Implementados

### 4.1 Viajes (Modulo Central)
- CRUD completo con 5 estados: pendiente, en_curso, finalizado, liquidado, cancelado
- `nro_viaje` auto-generado (secuencial)
- `fecha_salida` default = hoy, es el unico campo required
- Todos los demas campos son nullable
- Multi-unidad: N:N via tabla pivote `viaje_unidad`
- Asignacion de recursos (choferes propios o tercerizados)
- Sistema de tarifas flexible
- Gestion de cargas (1:1)
- Documento asociado (1:1): REMITO, CARTA_DE_PORTE, HOJA_DE_RUTA, con archivos adjuntos
- Liquidaciones via pivot (N:N)
- Gastos por viaje: clasificacion propio/tercerizado, flag reintegro, recalculo automatico de `costo_viaje`
- Anticipos por viaje

### 4.2 Clientes y Proveedores
- CRUD completo con soft delete (archivar/restaurar)
- Relacion con viajes, liquidaciones y recursos

### 4.3 Recursos
- **Unidades:** CRUD, soporte propios/tercerizados, multi-asignacion a viajes, campo numero interno
- **Choferes:** CRUD, legajos, control LINTI, propios/tercerizados, campo numero interno

### 4.4 Documentos
- 1:1 con viaje
- Tipos: REMITO, CARTA_DE_PORTE, HOJA_DE_RUTA
- Estados: pendiente, conforme, rechazado
- Archivos adjuntos: tabla `documento_archivos` (N:N)

### 4.5 Liquidaciones
- CRUD completo con soft delete
- Numeracion automatica: LIQ-C-XXXX (clientes), LIQ-P-XXXX (proveedores)
- Estados: borrador → pendiente → facturada
- Wizard de creacion con filtros dinamicos
- Agregar/quitar viajes en estado borrador
- Actualizar monto por viaje
- Calculo automatico de total
- Viaje pasa a "liquidado" al pasar a estado pendiente
- Viajes cancelados no se pueden agregar

### 4.6 Facturacion
- CRUD completo (mock por ahora)
- Referencia a liquidacion (no a viaje directamente)

### 4.7 Dashboard
- Metricas (conectado a API)
- Soporte para modo Proteccion Visual

---

## 5. Modelos de Base de Datos

| Modelo | Descripcion | Relaciones clave |
|--------|-------------|-----------------|
| `Viaje` | Entidad central | cliente, proveedor, unidades (N:N), chofer, carga, documento, liquidaciones, gastos, anticipos |
| `Cliente` | Entidad comercial | viajes, liquidaciones |
| `Proveedor` | Transporte tercerizado | viajes, liquidaciones, unidades, choferes |
| `Chofer` | Personal de conduccion | viajes, proveedor (campo `numero`) |
| `Unidad` | Vehiculos | viajes (N:N), proveedor (campo `numero`) |
| `Carga` | Tipos de carga (1:1 con viaje) | viaje |
| `Documento` | Documento del viaje (1:1) | viaje, archivos (N:N) |
| `DocumentoArchivo` | Archivos adjuntos de documentos | documento |
| `Liquidacion` | Agrupacion de viajes | cliente, proveedor, viajes (N:N), factura |
| `Factura` | Documento de facturacion | liquidacion |
| `Gasto` | Gastos por viaje | viaje (campos: clase propio/tercerizado, reintegro) |
| `Anticipo` | Anticipos por viaje | viaje |
| `User` | Usuarios del sistema | — |

---

## 6. Endpoints API

```
Viajes:
  GET/POST        /api/viajes
  GET/PUT/DELETE   /api/viajes/{id}
  POST             /api/viajes/{id}/restore

Clientes:
  GET/POST        /api/clientes
  GET/PUT/DELETE   /api/clientes/{id}
  POST             /api/clientes/{id}/restore

Proveedores:
  GET/POST        /api/proveedores
  GET/PUT/DELETE   /api/proveedores/{id}
  POST             /api/proveedores/{id}/restore

Choferes:
  GET/POST        /api/choferes
  GET/PUT/DELETE   /api/choferes/{id}
  POST             /api/choferes/{id}/restore

Unidades:
  GET/POST        /api/unidades
  GET/PUT/DELETE   /api/unidades/{id}
  POST             /api/unidades/{id}/restore

Documentos:
  GET/POST        /api/documentos
  GET/PUT/DELETE   /api/documentos/{id}
  POST             /api/documentos/{id}/restore
  POST             /api/documentos/{id}/archivos        (subir archivo)
  DELETE           /api/documentos/{id}/archivos/{archivoId}  (eliminar archivo)

Liquidaciones:
  GET/POST        /api/liquidaciones
  GET/PUT/DELETE   /api/liquidaciones/{id}
  POST             /api/liquidaciones/{id}/restore
  GET              /api/liquidaciones/{id}/viajes-disponibles
  POST             /api/liquidaciones/{id}/viajes        (agregar viajes)
  DELETE           /api/liquidaciones/{id}/viajes/{viajeId}
  PUT              /api/liquidaciones/{id}/viajes/{viajeId}/monto
  PUT              /api/liquidaciones/{id}/estado

Facturas:
  GET/POST        /api/facturas
  GET/PUT/DELETE   /api/facturas/{id}
  POST             /api/facturas/{id}/restore

Gastos:
  GET/POST        /api/gastos
  GET/PUT/DELETE   /api/gastos/{id}
  POST             /api/gastos/{id}/restore

Anticipos:
  GET/POST        /api/anticipos
  GET/PUT/DELETE   /api/anticipos/{id}
  POST             /api/anticipos/{id}/restore
```

---

## 7. Entorno de Desarrollo

### Inicio rapido
```bash
# Opcion 1: doble click en los .bat
iniciar-backend.bat    # Laravel en http://localhost:8000
iniciar-frontend.bat   # Vite en http://localhost:5173

# Opcion 2: manual
cd api && php artisan serve
cd client && npm run dev
```

### Reset de base de datos
```bash
# Doble click en reset-db.bat o:
cd api && php artisan migrate:fresh --seed --force
```

### Seeder incluido (TestSeeder)
- 2 clientes (Transporte SRL, Distribuidora Norte)
- 2 proveedores (Fletero Lopez, Transportes del Sur)
- 2 choferes propios + 2 externos
- 2 unidades propias + 2 externas
- 1 usuario Admin (admin@tag.com / admin123)

---

## 8. Pendiente / Proximo

- [ ] **Frontend**: pagina en blanco al abrir (bug runtime, build compila OK)
- [ ] **Factura**: creacion completa (actualmente mock)
- [ ] **Dashboard**: metricas conectadas a API real
- [ ] **Documentos**: paginado y filtros avanzados
- [ ] **Documentos**: upload real de archivos (backend listo, frontend pendiente)
- [ ] **Deploy**: adaptar entorno para MySQL (produccion)
- [ ] **Auth**: login real con Sanctum (actualmente bypass)
- [ ] **Auditoria**: campos created_by/updated_by con usuario real
