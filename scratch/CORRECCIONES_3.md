# CORRECCIONES_3 — Pendientes

## 1. Dropdown estado liquidaciones — texto invisible
- No se ve el texto en el dropdown de estado de las liquidaciones
- Misma solución aplicada al dropdown de viajes (color explícito)

## 2. Print liquidación — alineación y tamaño de cabecera
- Fecha Emisión, Liquidación Nro, Proveedor/Cliente, CUIT deben ser del **mismo tamaño de fuente**
- Todos alineados a la derecha (como están), pero con fontSize uniforme

## 3. Print liquidación — chofer, unidad y cliente no se ven
- En la tabla de viajes de la liquidación, las columnas de Chofer/Unidad y Cliente no muestran datos
- Verificar que el endpoint `show` carga las relaciones correctas (chofer, unidades, cliente)
- Puede ser que `v.chofer?.nombre` no funcione si la relación no viene en el nested eager load

## 4. Liquidación — quitar vista previa, usar desplegable de detalles
- Quitar la vista previa completa de la liquidación (modal o sección fija)
- En su lugar, implementar un **desplegable de detalles por viaje** dentro de la liquidación
- Similar a como funciona en Viajes (expandir fila para ver detalles)
- Cada viaje desplegable mostrará: chofer, unidad, cliente, gastos, anticipos, monto

## 5. Dropdown imprimibles viaje — posición
- El dropdown de imprimibles de viaje queda **dentro de la fila** visualmente
- Debe quedar **fuera de la fila**, posicionado como el dropdown de estado de viaje
- Usar `position: fixed` + cálculo con `getBoundingClientRect()` (ya aplicado en estado, replicar para imprimibles)

## 6. Print detalle de viaje — GANANCIA → TOTAL
- Cambiar la etiqueta "GANANCIA" por "TOTAL" en el PrintTripDetail

## 7. Prints — Cliente/CUIT/Nro alineados a derecha con fuente grande
- En **todos los prints** (PrintReceipt, PrintDocumentVoucher, PrintTripSheet, PrintTripDetail):
  - Cliente, CUIT y Nro de documento: **alineados a la derecha**, **fuente grande y clara**
  - Ya parcialmente aplicado en Fix 4, verificar consistencia

## 8. Prints liquidación — no lleva Nro de documento
- Las liquidaciones **NO** llevan Nro de documento asociado
- Si es liquidación de **proveedor**: mostrar Proveedor + CUIT
- Si es liquidación de **cliente**: mostrar Cliente + CUIT
- Ya parcialmente aplicado, verificar que funcione correctamente

## 9. Quitar ESTADO del documento asociado
- En **todos los prints**, quitar la línea de "Estado" del viaje
- No importa qué documento sea: no mostrar estado

## 10. Print documento — reorganizar layout
- PrintDocumentVoucher tiene **datos repetidos y desordenados**
- Reorganizar: eliminar duplicados, ordenar campos lógicamente
- Campos sugeridos en orden:
  - **Izquierda**: Empresa (TAG Logística), Tipo de comprobante
  - **Derecha**: Fecha, Viaje Nro, Cliente/Proveedor + CUIT, Nro Documento
  - **Cuerpo**: Tabla con concepto, detalle, monto
  - **Footer**: Total, observaciones
