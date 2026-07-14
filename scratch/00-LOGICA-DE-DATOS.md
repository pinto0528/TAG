# Logica de Datos - TAG Logistica

## Flujo Principal

```
Viaje → DOCUMENTO (REMITO | CARTA DE PORTE | HOJA DE RUTA)
  ↓ (se agrupan en liquidaciones)
Liquidacion CLIENTE → agrupa viajes para cobrar al cliente
  ↓
Factura (al cliente)

Liquidacion PROVEEDOR → agrupa viajes para pagar al proveedor
  ↓
Factura (al proveedor)
```

## Reglas confirmadas

1. **Cada viaje tiene UN SOLO documento** (REMITO, CARTA_DE_PORTE, o HOJA_DE_RUTA)
2. **El NRO del documento NO es unico** - viene del cliente, no lo controlamos
3. **El tipo de documento tambien viene del cliente** - no lo controlamos
4. **Un viaje puede estar en hasta 2 liquidaciones**: una CLIENTE y una PROVEEDOR (una de cada tipo)
5. **Una liquidacion es para UNA entidad** (un cliente O un proveedor)
6. **Gastos y Anticipos se mantienen en Viaje**
7. **Se quitan Ordenes de Pago y Cheques por ahora**
8. **Liquidacion es proceso MANUAL** - el usuario selecciona viajes
9. **Solo se puede agregar viajes a liquidacion en estado BORRADOR**
10. **Monto por viaje: precio del viaje, editable**
11. **Empezar de cero** - no migrar datos viejos
12. **Numeracion separada por tipo**: LIQ-C-0001 (clientes), LIQ-P-0001 (proveedores)
13. **Liquidaciones se pueden archivar/restaurar** (soft delete)
14. **Factura queda como mock** por ahora (no se implementa completamente)
15. **Viajes cancelados NO se pueden agregar a liquidaciones**
16. **nro_viaje se asigna automaticamente** (secuencial)
17. **Solo fecha_salida es required** al crear viaje, todo lo demas es nullable
18. **Un viaje puede tener N unidades** (multi-unidad via tabla pivote `viaje_unidad`)
19. **Gastos se clasifican**: propio/tercerizado + flag reintegro (boolean)
20. **costo_viaje se auto-calcula** al modificar gastos o anticipos:
    - `costo_proveedor_ajustado = costo_proveedor - totalAnticipos - propio_con_reintegro + tercerizado_con_reintegro`
    - `costo_viaje = costo_proveedor_ajustado + propio_sin_reintegro + tercerizado_con_reintegro`
21. **Documentos soportan archivos adjuntos** via tabla `documento_archivos`
22. **Unidades y Choferes tienen campo `numero`** (numero interno)

## Estados

### Viaje (5 estados)
```
pendiente → en_curso → finalizado → liquidado
    ↓           ↓
cancelado   cancelado
```
- **pendiente**: viaje creado, no iniciado
- **en_curso**: viaje en movimiento
- **finalizado**: viaje completado (llego a destino)
- **liquidado**: viaje asignado a una liquidacion (uno o ambos tipos)
- **cancelado**: viaje cancelado (desde pendiente o en_curso)

### Liquidacion
```
borrador → pendiente → facturada
```

### Documento
- pendiente → conforme
- pendiente → rechazado

### Factura
- pendiente → pagada
- pendiente → anulada

---

# PLAN DE IMPLEMENTACION

## Fase 1: Base de Datos (Migraciones) — COMPLETADA

### 1.1 Tabla `documentos` — COMPLETADO
### 1.2 Tabla `liquidaciones` — COMPLETADO
### 1.3 Tabla pivote `liquidacion_viaje` — COMPLETADO
### 1.4 Modificar tabla `facturas` (viaje_id → liquidacion_id) — COMPLETADO
### 1.5 Eliminar tablas (remitos, ordenes_pago, cheques) — COMPLETADO
### 1.6 Agregar `nro_viaje` y hacer campos nullable en viajes — COMPLETADO
### 1.7 Agregar `numero` a unidades y choferes — COMPLETADO
### 1.8 Multi-unidad: drop+recreate viajes, crear pivot `viaje_unidad` — COMPLETADO
### 1.9 Tabla `documento_archivos` para archivos adjuntos — COMPLETADO
### 1.10 Agregar `clase`+`reintegro` a gastos, `costo_viaje` a viajes — COMPLETADO

---

## Fase 2: Backend (Laravel) — COMPLETADA

### 2.1 Modelos nuevos — COMPLETADO
- `app/Models/Documento.php` — 1:1 con Viaje
- `app/Models/DocumentoArchivo.php` — archivos adjuntos de documentos
- `app/Models/Liquidacion.php` — N:N con Viaje via pivot

### 2.2 Modelos modificados — COMPLETADO
- `Viaje.php` — `unidades()` BelongsToMany, `costo_viaje` auto-calculado, `recalcularCostoViaje()`
- `Gasto.php` — campos `clase` (propio|tercerizado), `reintegro` (boolean)
- `Factura.php` — liquidacion() en vez de viaje()
- `Cliente.php` — liquidaciones()
- `Proveedor.php` — liquidaciones()
- `Unidad.php`, `Chofer.php` — campo `numero`

### 2.3 Modelos eliminados — COMPLETADO
- `Remito.php`, `OrdenPago.php`, `Cheque.php`

### 2.4 Controllers nuevos — COMPLETADO
- `DocumentoController.php` — CRUD + storeArchivo/destroyArchivo
- `LiquidacionController.php` — CRUD + viajes-disponibles, agregar/quitar viajes, actualizar monto, cambiar estado

### 2.5 Controllers modificados — COMPLETADO
- `ViajeController.php` — multi-unidad (`unidades` array), eager loading actualizado
- `GastoController.php` — validacion clase+reintegro, auto-recalcula costo_viaje
- `FacturaController.php` — filtrado por liquidacion

### 2.6 Controllers eliminados — COMPLETADO
- `RemitoController.php`, `OrdenPagoController.php`, `ChequeController.php`

### 2.7 Rutas — COMPLETADO
### 2.8 Enum EstadoViaje — COMPLETADO (5 estados)

### Bugs corregidos durante implementacion
- Falta import `Illuminate\Database\Eloquent\Model` en todos los modelos
- `LOCATE()` MySQL no existe en SQLite — rewrite con regex PHP
- `pivot.monto` alias — query directa a tabla pivot
- Route model binding mismatch en Chofer/Unidad show
- `liquidacion_viaje` sin timestamps

---

## Fase 3: Frontend (React) — PARCIALMENTE COMPLETADA

### 3.1 Trips.jsx — COMPLETADO
- 5 estados con badges
- Documento 1:1 (no lista de remitos)
- Formulario de documento: tipo, numero, fecha, estado

### 3.2 Settlements.jsx — COMPLETADO
- Conectado a API real
- Wizard paso 1: tipo, entidad, filtros
- Wizard paso 2: seleccion de viajes con monto auto-calculado
- Tabla principal con estados y acciones

### 3.3 Billing.jsx — COMPLETADO
- Conectado a API real
- Lista de facturas por liquidacion

### 3.4 Dashboard.jsx — COMPLETADO
- Conectado a API real (mockData eliminado)

### 3.5 Documentation.jsx — COMPLETADO
- Conectado a API real

### Pendiente frontend
- [ ] Bug: pagina en blanco al abrir (build compila OK, error runtime)
- [ ] Verificar todos los flujos en el navegador

---

## Fase 4: Limpieza — COMPLETADA

### 4.1 Archivos eliminados
- `api/app/Models/Remito.php`, `OrdenPago.php`, `Cheque.php`
- `api/app/Http/Controllers/RemitoController.php`, `OrdenPagoController.php`, `ChequeController.php`
- `client/src/data/mockData.js`

### 4.2 Documentacion — COMPLETADO
- `HISTORY.md` actualizado
- `ESTADO_DEL_PROYECTO.md` actualizado
- `00-LOGICA-DE-DATOS.md` actualizado (este archivo)
