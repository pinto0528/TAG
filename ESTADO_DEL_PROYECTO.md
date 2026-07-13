# Estado del Proyecto - TAG Logistica

**Fecha del documento:** 13 de julio de 2026
**Ultimo commit:** `64d15e2` — 6 de mayo de 2026 (hace ~2 meses)
**Rama activa:** `develop`

---

## 1. Resumen General

TAG Logistica es un sistema de gestion integral para empresas de transporte y logistica. Permite administrar clientes, proveedores, recursos (unidades/choferes), viajes, finanzas y documentacion desde una unica plataforma.

**Produccion:** `http://logisticatag.com.ar` (DonWeb hosting compartido)

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend | React + Vite | React 19, Vite 8 |
| Backend | Laravel | 13 (PHP 8.3+) |
| Base de datos | MySQL | 8.0 |
| Auth | Laravel Sanctum | 4.x |
| UI Charts | Recharts | 3.8 |
| Icons | Lucide React | 1.7 |
| Router | React Router DOM | 7.13 |

---

## 3. Estructura del Proyecto

```
TAG/
├── api/                    # Backend Laravel
│   ├── app/
│   │   ├── Enums/          # EstadoViaje
│   │   ├── Http/Controllers/  # 11 controladores
│   │   └── Models/         # 12 modelos Eloquent
│   ├── config/
│   ├── database/
│   │   ├── migrations/     # 18 migraciones
│   │   └── seeders/        # DatabaseSeeder
│   ├── routes/api.php      # Rutas API
│   └── public/.htaccess    # Config SPA + API
├── client/                 # Frontend React
│   └── src/
│       ├── pages/          # 10 paginas
│       ├── data/           # mockData.js
│       └── apiConfig.js
├── docker-compose.yml      # Orquestacion local
├── pre-deploy.bat          # Script de despliegue
├── DEPLOYMENT_GUIDE.md     # Guia para DonWeb
└── HISTORY.md              # Registro de cambios
```

---

## 4. Modulos Implementados

### 4.1 Viajes (Modulo Central)
- CRUD completo con ciclo de vida
- Estados: Pendiente, En Curso, Completado, Cancelado
- Asignacion de recursos (choferes, unidades propios o tercerizados)
- Sistema de tarifas flexible (por km, bulto, tonelada, tarifa plana)
- Gestion de cargas
- Hoja de ruta imprimible (A4)
- Filtros y busqueda

### 4.2 Clientes y Proveedores
- Gestion de entidades comerciales
- Contactos y datos de comunicacion
- Relacion con viajes y recursos

### 4.3 Recursos
- **Unidades:** Camiones y acoplados, seguimiento VTV/Seguros
- **Choferes:** Legajos, contactos, control LINTI
- Soporte para recursos propios y tercerizados

### 4.4 Finanzas
- **Gastos:** Registro por viaje
- **Anticipos:** Control por viaje
- **Facturacion:** Facturas, Ordenes de Pago, Cheques
- Trazaabilidad completa: Remito -> Factura -> Orden de Pago -> Cheque

### 4.5 Liquidaciones (Settlements)
- Wizard de creacion con filtros dinamicos
- Rango de fechas por defecto (semana actual)
- Previsualizacion e impresion en formato landscape
- Totales de gastos y anticipos por viaje
- Validacion de viajes ya liquidados

### 4.6 Documentacion
- Generacion de hojas de ruta
- Comprobantes de gastos y anticipos
- Documentos de liquidacion

### 4.7 Dashboard
- Metricas financieras
- Resumen operativo
- Soporte para modo Proteccion Visual

---

## 5. Modelos de Base de Datos

| Modelo | Descripcion |
|--------|-------------|
| `Viaje` | Entidad central, relaciona todo |
| `Cliente` | Entidad comercial |
| `Proveedor` | Transporte tercerizado |
| `Chofer` | Personal de conduccion |
| `Unidad` | Vehiculos (camiones/semi) |
| `Carga` | Tipos de carga |
| `Factura` | Documentos de facturacion |
| `Remito` | Documentos de despacho |
| `OrdenPago` | Órdenes de pago |
| `Cheque` | Instrumentos de pago |
| `Gasto` | Gastos por viaje |
| `Anticipo` | Anticipos por viaje |
| `User` | Usuarios del sistema |

---

## 6. Estado de Ramas

| Rama | Commits | Estado |
|------|---------|--------|
| `develop` | 25 | **Activa** - rama principal de desarrollo |
| `master` | 1 | Obsoleta - solo tiene el commit inicial |
| `resources` | 25 | Identica a develop (duplicada) |
| `trips` | 9 | Obsoleta - subset antiguo de develop |

**Nota:** Las ramas `resources` y `trips` podrian eliminarse sin afectar el proyecto.

---

## 7. Endpoints API

```
GET/POST        /api/viajes
GET/PUT/DELETE   /api/viajes/{id}
GET/POST        /api/clientes
GET/PUT/DELETE   /api/clientes/{id}
GET/POST        /api/proveedores
GET/PUT/DELETE   /api/proveedores/{id}
GET/POST        /api/choferes
GET/PUT/DELETE   /api/choferes/{id}
GET/POST        /api/unidades
GET/PUT/DELETE   /api/unidades/{id}
GET/POST        /api/facturas
GET/POST        /api/remitos
GET/POST        /api/ordenes-pago
GET/POST        /api/cheques
GET/POST        /api/gastos
GET/POST        /api/anticipos
```

---

## 8. Entorno de Desarrollo (Docker)

```yaml
Servicios:
  db:       MySQL 8.0 (puerto 3306, user: root, pass: root)
  api:      Laravel artisan serve (puerto 8000)
  client:   Vite dev server (puerto 5173)
```

**Para levantar:**
```bash
docker compose up -d
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate
docker compose exec api php artisan db:seed
```

---

## 9. Entorno de Produccion (DonWeb)

- **URL:** `http://logisticatag.com.ar`
- **API:** `http://logisticatag.com.ar/api`
- **Hosting:** Ferozo (compartido, sin Docker)
- **Frontend:** Build estatico subido por FTP a `public_html`
- **Backend:** Laravel en subcarpeta, Apache con PHP-FPM

**Proceso de deploy:**
1. Ejecutar `pre-deploy.bat`
2. Subir `client/dist` a `public_html` por FTP
3. Subir `api/` al servidor
4. Configurar `.env` en el servidor
5. Ejecutar migraciones en el servidor

---
