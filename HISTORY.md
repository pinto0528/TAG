# Historial de Cambios - TAG LogÃ­stica

Este documento contiene un resumen del sistema y el registro de las modificaciones, mejoras y correcciones realizadas durante el desarrollo.

## Resumen del Sistema
Sistema de gestion para una empresa de logistica y transporte. Permite la administracion de:
- **Clientes y Proveedores**: Gestion de entidades comerciales con trazabilidad de contactos.
- **Recursos**: Control de Unidades (camiones/semi) y Choferes (propios o tercerizados).
- **Viajes**: Modulo central que gestiona la operacion, incluyendo datos de carga, rutas, tarifas y estados.
- **Documentacion y Finanzas**: Seguimiento completo de la cadena documental (Remitos -> Facturas -> Órdenes de Pago -> Cheques) y movimientos financieros (Gastos y Anticipos).

### 2026-05-06
- **[VIAJES]** Inclusión de detalles de Gastos y Anticipos en la Hoja de Ruta impresa.
- **[VIAJES]** Ajuste de estilos en el detalle de viajes para compatibilidad con el modo Protección Visual.
- **[SETTLEMENTS]** Refactorización del módulo de Liquidaciones: Renombre de archivos y componentes a inglés (`Settlements`).
- **[SETTLEMENTS]** Inclusión de totales de Gastos y Anticipos por viaje en previsualización e impresión.
- **[SETTLEMENTS]** Implementación de rango de fechas por defecto (semana actual) en el asistente de creación.
- **[SETTLEMENTS]** Preparación de lógica para validación de viajes ya liquidados (flag de control).
- **[DEPLOY]** Creación de `DEPLOYMENT_GUIDE.md` y `pre-deploy.bat` para despliegue en Hosting Compartido (DonWeb).
- **[PERFORMANCE]** Investigación y diagnóstico del cuello de botella en la carga de datos (artisan serve concurrency).

### 2026-05-05
- **[UI/UX]** Reemplazo de alertas nativas (`confirm`/`alert`) por modales personalizados.
- **[UI/UX]** Unificación de spinners de carga en todos los módulos.
- **[UI/UX]** Estandarización de botones Archivar/Restaurar (ubicación inferior-izquierda en modales).
- **[CLIENTES/PROV]** Limpieza de tablas: Mail y Teléfono visibles; eliminación de sub-menú de detalles.
- **[RECURSOS]** Traslado de botones de archivo al formulario de edición.
- **[VIAJES]** Implementación de carga completa de relaciones (eager loading) en la API.
- **[VIAJES]** Corrección de CRUD y trazabilidad: Remito -> Factura -> Orden de Pago -> Cheque.
- **[VIAJES]** Desvinculación de gastos/anticipos del cálculo de margen operativo (informativos).
- **[VIAJES]** Unificación de color para estado "Pendiente" (Amarillo/Warning) en documentos.
- **[DB]** Migración para corregir columnas faltantes en tablas de facturas y órdenes de pago.
- **[API]** Estandarización de headers `Accept: application/json` en todas las peticiones fetch.
- **[LIQUIDACIONES]** Nuevo módulo de liquidaciones para Clientes y Proveedores.
- **[LIQUIDACIONES]** Implementación de asistente de creación (wizard) con filtros dinámicos y selección de viajes.
- **[LIQUIDACIONES]** Sistema de previsualización e impresión de documentos en formato horizontal (landscape).
