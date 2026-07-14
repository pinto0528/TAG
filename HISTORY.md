# Historial de Cambios - TAG Logistica

Este documento contiene un resumen del sistema y el registro de las modificaciones, mejoras y correcciones realizadas durante el desarrollo.

## Resumen del Sistema
Sistema de gestion para una empresa de logistica y transporte. Permite la administracion de:
- **Clientes y Proveedores**: Gestion de entidades comerciales con trazabilidad de contactos.
- **Recursos**: Control de Unidades (camiones/semi) y Choferes (propios o tercerizados).
- **Viajes**: Modulo central que gestiona la operacion, incluyendo datos de carga, rutas, tarifas y estados.
- **Documentacion**: Cada viaje tiene UN documento asociado (REMITO, CARTA_DE_PORTE o HOJA_DE_RUTA).
- **Liquidaciones**: Viajes agrupados para cobrar al cliente o pagar al proveedor.
- **Facturacion**: Facturas generadas a partir de liquidaciones (mock por ahora).

### 2026-07-13 — Rediseño del modelo de datos + Multi-unidad + Costo viaje

#### Migraciones nuevas
- **`2026_07_13_000001_create_documentos_table`**: Tabla documentos (1:1 con viaje)
- **`2026_07_13_000002_create_liquidaciones_table`**: Tabla liquidaciones (con numero auto LIQ-C/LIQ-P)
- **`2026_07_13_000003_create_liquidacion_viaje_table`**: Tabla pivote con monto y timestamps
- **`2026_07_13_000004_modify_facturas_replace_viaje_with_liquidacion`**: Facturas ahora referencian liquidaciones
- **`2026_07_13_000005_drop_remitos_ordenes_pago_cheques_tables`**: Eliminadas tablas obsoletas
- **`2026_07_13_000006_add_nro_viaje_make_fields_nullable`**: `nro_viaje` auto, todos nullable excepto `fecha_salida` (default hoy)
- **`2026_07_13_000007_add_numero_to_unidades_and_choferes`**: Campo `numero` en unidades y choferes
- **`2026_07_13_000008_migrate_viajes_to_multi_unidad`**: Drop+recreate viajes sin `unidad_id`, crea pivot `viaje_unidad` (N:N)
- **`2026_07_13_000009_create_documento_archivos_table`**: Archivos adjuntos a documentos
- **`2026_07_13_000010_add_clase_reintegro_to_gastos_and_costo_viaje_to_viajes`**: `clase`+`reintegro` en gastos, `costo_viaje` en viajes

#### Modelos nuevos
- `Documento` — 1:1 con Viaje, tipos: REMITO | CARTA_DE_PORTE | HOJA_DE_RUTA, tiene `archivos()` (N:N)
- `DocumentoArchivo` — archivos adjuntos de documentos (path, nombre, mime, size)
- `Liquidacion` — N:N con Viaje via pivot, numeracion automatica LIQ-C-XXXX/LIQ-P-XXXX

#### Modelos eliminados
- `Remito`, `OrdenPago`, `Cheque`

#### Modelos modificados
- `Viaje` — `unidades()` BelongsToMany via pivot `viaje_unidad`, accessor `unidad` backward-compatible, `costo_viaje` auto-calculado, `recalcularCostoViaje()` en boot
- `Gasto` — campos nuevos: `clase` (propio|tercerizado), `reintegro` (boolean)
- `Factura` — relacion `liquidacion()` en vez de `viaje()`
- `Cliente`, `Proveedor` — relacion `liquidaciones()`
- `Unidad`, `Chofer` — campo `numero` nuevo

#### Controllers nuevos
- `DocumentoController` — CRUD completo + `storeArchivo()` / `destroyArchivo()` para archivos adjuntos
- `LiquidacionController` — CRUD + viajes-disponibles, agregar/quitar viajes, actualizar monto, cambiar estado

#### Controllers eliminados
- `RemitoController`, `OrdenPagoController`, `ChequeController`

#### Controllers modificados
- `ViajeController` — multi-unidad (`unidades` array en store/update), eager loading `unidades`
- `GastoController` — validacion `clase`+`reintegro`, auto-recalcula `costo_viaje` en CRUD
- `FacturaController` — filtrado por liquidacion_id

#### Rutas nuevas
- `POST /api/documentos/{id}/archivos` — subir archivo a documento
- `DELETE /api/documentos/{documentoId}/archivos/{archivoId}` — eliminar archivo

#### Frontend
- `Trips.jsx` — multi-unidad, gastos propio/tercerizado con reintegro, costo_viaje visible, selector de unidades
- `Resources.jsx` — campo numero en unidades/choferes
- `Settlements.jsx` — conectado a API real, wizard completo
- `Billing.jsx` — conectado a API real
- `Dashboard.jsx`, `Documentation.jsx` — mockData eliminado, conectado a API
- `mockData.js` — eliminado

#### Entorno de desarrollo
- PHP 8.4.23 instalado manualmente en `C:\php84`
- Base de datos SQLite (dev) en `api/database/database.sqlite`
- Seeder: `TestSeeder.php` — 2 clientes, 2 proveedores, 2 choferes propios, 2 externos, 2 unidades propias, 2 externas
- Scripts `.bat` en `bats/` para iniciar backend/frontend

#### Bugs corregidos
- `Class "App\Models\Model" not found` — falta import en todos los modelos
- `LOCATE()` MySQL en SQLite — rewrite de `generateNumero()` con regex PHP
- `pivot.monto` alias — query directa a tabla pivot
- Route model binding mismatch — `Chofer show`, `Unidad show` cambiados a `findOrFail($id)`
- `liquidacion_viaje.created_at` missing — agregados timestamps a tabla pivot

#### Fórmula de costo de viaje
```
costo_proveedor_ajustado = costo_proveedor - totalAnticipos - propio_con_reintegro + tercerizado_con_reintegro
costo_viaje = costo_proveedor_ajustado + propio_sin_reintegro + tercerizado_con_reintegro
```

### 2026-05-06
- **[VIAJES]** Inclusion de detalles de Gastos y Anticipos en la Hoja de Ruta impresa.
- **[VIAJES]** Ajuste de estilos en el detalle de viajes para compatibilidad con el modo Proteccion Visual.
- **[SETTLEMENTS]** Refactorizacion del modulo de Liquidaciones: Renombre de archivos y componentes a ingles (`Settlements`).
- **[SETTLEMENTS]** Inclusion de totales de Gastos y Anticipos por viaje en previsualizacion e impresion.
- **[SETTLEMENTS]** Implementacion de rango de fechas por defecto (semana actual) en el asistente de creacion.
- **[SETTLEMENTS]** Preparacion de logica para validacion de viajes ya liquidados (flag de control).
- **[DEPLOY]** Creacion de `DEPLOYMENT_GUIDE.md` y `pre-deploy.bat` para despliegue en Hosting Compartido (DonWeb).
- **[PERFORMANCE]** Investigacion y diagnostico del cuello de botella en la carga de datos (artisan serve concurrency).

### 2026-05-05
- **[UI/UX]** Reemplazo de alertas nativas (`confirm`/`alert`) por modales personalizados.
- **[UI/UX]** Unificacion de spinners de carga en todos los modulos.
- **[UI/UX]** Estandarizacion de botones Archivar/Restaurar (ubicacion inferior-izquierda en modales).
- **[CLIENTES/PROV]** Limpieza de tablas: Mail y Telefono visibles; eliminacion de sub-menu de detalles.
- **[RECURSOS]** Traslado de botones de archivo al formulario de edicion.
- **[VIAJES]** Implementacion de carga completa de relaciones (eager loading) en la API.
- **[VIAJES]** Correccion de CRUD y trazabilidad: Remito -> Factura -> Orden de Pago -> Cheque.
- **[VIAJES]** Desvinculacion de gastos/anticipos del calculo de margen operativo (informativos).
- **[VIAJES]** Unificacion de color para estado "Pendiente" (Amarillo/Warning) en documentos.
- **[DB]** Migracion para corregir columnas faltantes en tablas de facturas y ordenes de pago.
- **[API]** Estandarizacion de headers `Accept: application/json` en todas las peticiones fetch.
- **[LIQUIDACIONES]** Nuevo modulo de liquidaciones para Clientes y Proveedores.
- **[LIQUIDACIONES]** Implementacion de asistente de creacion (wizard) con filtros dinamicos y seleccion de viajes.
- **[LIQUIDACIONES]** Sistema de previsualizacion e impresion de documentos en formato horizontal (landscape).
