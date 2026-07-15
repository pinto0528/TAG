# Correcciones - 2026-07-15

## 1. Tab Finanzas — compactar verticalmente ✅
- Alineada a la derecha, layout en rows flex con justify-between
- Textos del mismo tamaño (0.78rem), números del mismo tamaño (0.85rem)
- Total más grande (1.3rem) con fondo verde/rojo
- Sin fórmula desglosada
- Espaciado vertical reducido (padding 0.3rem por fila)

## 2. Dropdown de imprimir no funciona ✅
- Causa: faltaba `e.stopPropagation()` en el onClick del botón
- El click se propagaba al document listener que cerraba el dropdown inmediatamente

## 3. Archivar viajes — funciona desde el modal de edición
- El botón "Archivar Viaje" está dentro del TripFormModal (al editar un viaje)
- No hay botón de archivar en la grilla directamente
- Si el backend no está corriendo, el DELETE falla silenciosamente

## 4. Liquidación desaparecida
- Posiblemente por reset de DB o cambio de eager loading
- Crear una nueva desde la UI (pestana Liquidaciones → Nueva Liquidación)

## 5. Dropdown de estado en viajes ✅
- Cambiado a `position: fixed` con `zIndex: 9999` para que se abra fuera de la fila
- Calcula posición con `getBoundingClientRect()` del botón
- Muestra todos los estados posibles (excepto el actual) sin restricciones
- Mismo fix aplicado al dropdown de liquidaciones
