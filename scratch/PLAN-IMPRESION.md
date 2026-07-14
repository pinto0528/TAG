# Plan: Sistema de Impresión Profesional y Finanzas

Fecha: 2026-07-14

## Resumen de cambios

5 modificaciones en `Trips.jsx`, 1 cambio en `index.css`, 1 cambio en `Settlements.jsx`.

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

## 1. Estilo profesional para todos los imprimibles (monoespaciado + tablas Excel) ✅ COMPLETADO

**Archivos:** `Trips.jsx`, `Settlements.jsx`, `index.css`

Cambiar `fontFamily` a `'Courier New', 'Consolas', monospace` en todos los componentes de impresión:
- `PrintReceipt` ✅
- `PrintDocumentVoucher` ✅
- `PrintSelectedTable` ✅
- `PrintTripSheet` ✅
- `PrintLiquidacionSheet` ✅
- Nuevo: `PrintTripDetail` (punto 4)

Agregar borde de tabla estilo Excel: bordes sólidos 1px en celdas, fondo gris en headers, alineación consistente. Cada impresión lleva `<style>@page { size: A4 portrait/landscape; margin: 10mm; }</style>`.

---

## 2. Agregar info del viaje (Nro, Cliente, CUIT) a todos los imprimibles

**Archivo:** `Trips.jsx`

En cada componente de impresión, agregar cabecera con:
- **Nro de Viaje:** `viaje.codigo_viaje`
- **Cliente:** `viaje.cliente?.razon_social` (ya viene del eager loading)
- **CUIT:** `viaje.cliente?.cuit`

Esto aplica a:
- `PrintTripSheet`: Ya tiene `Nº {viaje.codigo_viaje}`, agregar Cliente + CUIT en el header derecho
- `PrintReceipt`: Agregar línea debajo de "Viaje Nro"
- `PrintDocumentVoucher`: Ya tiene Cliente, agregar CUIT
- `PrintSelectedTable`: Agregar columna "Cliente" en la tabla
- Nuevo `PrintTripDetail`: Incluir en el header

---

## 3. Cambios en la tab Finanzas

**Archivo:** `Trips.jsx`, sección Finanzas (líneas 1266-1289)

**Quitar:**
- La línea de "Ganancia" (línea 1276)

**Agregar:**
- Un bloque grande al final que muestre el **TOTAL DEL VIAJE**:

```
TOTAL = Precio Acordado - (Costo Proveedor - Anticipos) - Gastos propios s/reintegro - Gastos tercerizados c/reintegro
```

Visualmente: fondo con color, borde, texto grande centrado, resultado con signo +/- para indicar ganancia/pérdida.

---

## 4. Nuevo imprimible: Detalle de Viaje (apaisado, tabla financiera)

**Archivo:** `Trips.jsx`

Nuevo componente `PrintTripDetail`:
- `@page { size: A4 landscape; margin: 10mm; }`
- Header: TAG Logística / Detalle de Viaje / Nº + Cliente + CUIT
- **Tabla financiera** con columnas:

| Concepto | Tipo | Clase | Reintegro | Monto |

Con subtotales:
- Costo Proveedor (base)
- (-) Anticipos
- (=) Costo Proveedor Ajustado
- (-) Gastos Propios s/Reintegro
- (-) Gastos Tercerizados c/Reintegro
- (+) Gastos Propios c/Reintegro (si aplican)
- (=) **TOTAL DEL VIAJE**
- Precio Acordado
- **= GANANCIA/PÉRDIDA**

- Firma: "Firma Autorizada" / "Fecha"

---

## 5. Reemplazar botón de imprimir por menú desplegable

**Archivo:** `Trips.jsx`, línea 1724-1731

Reemplazar el botón `<Printer />` por un componente dropdown con 2 opciones:
- **Hoja de Ruta** → `setPrintMode('sheet')`
- **Detalle de Viaje** → `setPrintMode('detail')`

Implementar con estado local `printDropdownOpen` por fila, usando `ChevronDown` icon. Se cierra al hacer click fuera o al seleccionar una opción.

Agregar `printMode === 'detail'` al sistema de renderizado existente (línea 1822).

---

## Orden de implementación

1. `index.css` — agregar estilos base de impresión monoespaciada ✅
2. `Trips.jsx` + `Settlements.jsx` — actualizar los 5 componentes de impresión existentes (estilo) ✅
3. `Trips.jsx` — crear componente `PrintTripDetail`
4. `Trips.jsx` — modificar tab Finanzas (quitar ganancia, agregar TOTAL)
5. `Trips.jsx` — reemplazar botón imprimir por dropdown
6. `Trips.jsx` / `Settlements.jsx` — agregar info del viaje (Nro, Cliente, CUIT) a todos los imprimibles
7. Verificar compilación con `npm run lint` y `npm run build`

## Bugs / Fixes pendientes

- **PrintLiquidacionSheet (Settlements.jsx):** En liquidaciones de proveedores, no se muestra la unidad ni el chofer del viaje. Tampoco se muestra para qué cliente fue cada viaje. Agregar columna "Cliente" y completar "Chofer / Unidad" en la tabla.

## 6. Dropdown de estado en la grilla de viajes

**Archivo:** `Trips.jsx`

Reemplazar el botón de "marcar estado pendiente" por un **dropdown desplegable** directamente en la columna "Estado" de la grilla. El dropdown muestra los estados posibles (pendiente, en_curso, finalizado, cancelado) y permite cambiar el estado de un viaje directamente desde la grilla, sin necesidad de abrir el detalle.

Aplica tanto para viajes propios como tercerizados.
