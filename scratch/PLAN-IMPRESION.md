# Plan: Impresión, Finanzas y UX

Fecha: 2026-07-15 (actualizado)

## Imprimibles del sistema (6 total)

| # | Componente | Archivo | Descripción |
|---|---|---|---|
| 1 | `PrintReceipt` | Trips.jsx | Comprobante gasto/anticipo |
| 2 | `PrintDocumentVoucher` | Trips.jsx | Comprobante documento |
| 3 | `PrintSelectedTable` | Trips.jsx | Resumen de viajes |
| 4 | `PrintTripSheet` | Trips.jsx | Hoja de ruta |
| 5 | `PrintLiquidacionSheet` | Settlements.jsx | Liquidación |
| 6 | `PrintTripDetail` | Trips.jsx | Detalle financiero (NUEVO) |

---

## Grupo A: Monto por tipo de liquidación

### A1. Backend — Accessor `costo_proveedor_ajustado` ✅ COMPLETADO
**Archivo:** `api/app/Models/Viaje.php`

Agregar accessor que calcule:
```
costoProveedorAjustado = costo_proveedor - anticipos - propioReintegro + terceroReintegro
```
Reutiliza la lógica de `recalcularCostoViaje()` pero retorna en vez de guardar.

### A2. Backend — Eager load gastos/anticipos en viajesDisponibles ✅ COMPLETADO
**Archivo:** `api/app/Http/Controllers/LiquidacionController.php:137`

Agregar `gastos` y `anticipos` al `->with([...])` para que el accessor funcione sin N+1.

### A3. Frontend — Monto default por tipo ✅ COMPLETADO
**Archivo:** `client/src/pages/Settlements.jsx:194-196`

Inicializar `montosEditados` según tipo:
- `cliente`: `v.precio_pactado` (sin cambios)
- `proveedor`: `v.costo_proveedor_ajustado ?? v.costo_proveedor`

El usuario puede seguir editando el monto manualmente.

---

## Grupo B: Impresión y Finanzas

### B1. Info viaje (Nro, Cliente, CUIT) en todos los imprimibles
**Archivos:** `Trips.jsx`, `Settlements.jsx`

| Componente | Cambio |
|---|---|
| `PrintTripSheet` | Agregar Cliente + CUIT al header derecho |
| `PrintReceipt` | Agregar Cliente + CUIT debajo de "Viaje Nro" |
| `PrintDocumentVoucher` | Agregar CUIT junto a Viaje |
| `PrintSelectedTable` | Agregar columna "Cliente" |
| `PrintLiquidacionSheet` | Agregar CUIT en el header |
| `PrintTripDetail` | Incluir en header (al crear) |

### B2. Bug PrintLiquidacionSheet — columnas faltantes
**Archivo:** `Settlements.jsx:44-110`

Las columnas "Chofer / Unidad" y "Cliente" no se muestran para liquidaciones de proveedor.
Verificar que los datos vengan del backend del endpoint `show`.

### B3. Tab Finanzas — quitar ganancia, agregar TOTAL
**Archivo:** `Trips.jsx:1384-1407`

- Quitar línea "Ganancia" (línea 1394)
- Agregar bloque TOTAL grande al fondo:
  ```
  TOTAL = Precio - (Costo Prov - Anticipos) - Gastos propios s/reintegro - Gastos tercerizados c/reintegro
  ```
- Visualmente: fondo coloreado, borde, texto grande centrado, resultado con signo +/-

### B4. Nuevo PrintTripDetail (apaisado, tabla financiera)
**Archivo:** `Trips.jsx`

- `@page { size: A4 landscape; margin: 10mm; }`
- Header: TAG / Detalle de Viaje / Nº + Cliente + CUIT
- Tabla financiera con columnas: Concepto, Tipo, Clase, Reintegro, Monto
- Subtotales: Costo Proveedor (base), (-) Anticipos, (=) Costo Ajustado, (-) Propios s/Reintegro, (-) Tercerizados c/Reintegro, (=) TOTAL, Precio Acordado, = GANANCIA/PÉRDIDA
- Firma: "Firma Autorizada" / "Fecha"

### B5. Botón imprimir → dropdown
**Archivo:** `Trips.jsx:1842-1849`

Reemplazar `<Printer />` por dropdown con opciones:
- **Hoja de Ruta** → `setPrintMode('sheet')`
- **Detalle de Viaje** → `setPrintMode('detail')`

Implementar con estado local `printDropdownOpen` por fila, `ChevronDown` icon. Se cierra al click fuera o al seleccionar.

Agregar `printMode === 'detail'` al renderizado existente (línea 1946).

---

## Grupo C: Dropdowns de estado

### C1. Dropdown de estado en grilla de viajes Y liquidaciones
**Archivos:** `Trips.jsx`, `Settlements.jsx`

**Viajes:** Reemplazar botón de estado por dropdown inline en la columna "Estado" de la grilla. Estados posibles según estado actual:
- pendiente → en_curso, cancelado
- en_curso → finalizado, cancelado
- finalizado → liquidado (automático al crear liquidación)
- liquidado / cancelado → sin cambios

**Liquidaciones:** Dropdown inline en columna "Estado" de la grilla. Estados posibles:
- borrador → pendiente
- pendiente → facturada
- facturada → sin cambios

---

## Bugs / Fixes pendientes

- **PrintLiquidacionSheet:** En liquidaciones de proveedores, no se muestra unidad ni chofer del viaje. Tampoco se muestra para qué cliente fue cada viaje.

---

## Orden de implementación

1. A1 → A2 → A3 (backend + frontend monto por tipo)
2. B1 + B2 (imprimibles: info viaje + bug fix)
3. B3 (tab Finanzas)
4. B4 + B5 (PrintTripDetail + dropdown imprimir)
5. C1 (dropdowns de estado viajes + liquidaciones)
6. Verificar con `npm run lint` y `npm run build`
