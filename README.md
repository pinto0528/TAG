# TAG Logística - Sistema de Gestión Integral

**TAG Logística** es una plataforma diseñada para centralizar y optimizar la operativa diaria de empresas de transporte y logística. El sistema permite gestionar desde la asignación de recursos hasta la trazabilidad financiera y documental de cada viaje, proporcionando una solución integral para el control de la flota y la administración comercial.

---

## Módulos Principales

### 1. Gestión de Operaciones (Viajes)
El corazón del sistema. Permite el seguimiento en tiempo real de cada operación:
*   **Planificación**: Registro de origen, destino, fechas, horarios y asignación de carga.
*   **Asignación de Recursos**: Vinculación dinámica de choferes y unidades (propios o tercerizados).
*   **Tarifario Flexible**: Soporte para múltiples esquemas de cobro (por km, bulto, tonelada o tarifa plana).
*   **Trazabilidad Documental**: Flujo completo desde el remito hasta el pago (Remito -> Factura -> Orden de Pago -> Cheques).

### 2. Administración de Recursos
Control detallado de los activos y personal involucrado:
*   **Unidades**: Gestión de camiones y acoplados, incluyendo seguimiento de vencimientos de VTV y Seguros.
*   **Choferes**: Administración de legajos, contactos y control de licencias (LINTI).
*   **Proveedores (Fleteros)**: Gestión de transporte tercerizado para operaciones de red.

### 3. Finanzas y Liquidaciones
Control riguroso de los flujos de dinero asociados a la operación:
*   **Gastos y Anticipos**: Registro de movimientos financieros directos por viaje para un control de caja preciso.
*   **Módulo de Liquidaciones (Settlements)**: Herramienta avanzada para el cierre de períodos con choferes y proveedores. Permite filtrar viajes realizados, calcular saldos y generar documentos de liquidación profesionales.

### 4. Documentación e Impresión
Generación de documentos listos para la operación física:
*   **Hojas de Ruta**: Impresión optimizada (A4) con todos los detalles logísticos y financieros del viaje.
*   **Comprobantes**: Generación de vouchers para gastos, anticipos y documentos de liquidación en formatos profesionales (Portrait/Landscape).

---

## Tecnologías Utilizadas

*   **Frontend**: React 18 con Vite, utilizando un sistema de diseño propio basado en CSS nativo y una interfaz optimizada para largas jornadas de trabajo (Soporte para Modo Protección Visual).
*   **Backend**: API REST robusta desarrollada en Laravel 11, garantizando integridad de datos y escalabilidad.
*   **Base de Datos**: MySQL con soporte para eliminación lógica (Soft Deletes) y auditoría de registros.

---
*Este sistema ha sido desarrollado para transformar la complejidad logística en procesos simples, trazables y eficientes.*
