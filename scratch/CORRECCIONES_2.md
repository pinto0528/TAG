# Correcciones 2 - 2026-07-15

## 1. Finanzas — Costo Proveedor incorrecto
El costo proveedor mostrado es `costoProveedorAjustado` (costo - anticipos - propioReintegro + terceroReintegro), pero también se muestra el anticipo por separado. El usuario ve el anticipo restado DOS veces.

**Solución:** Mostrar `costo_proveedor` RAW (sin ajustar) en la fila de Costo Proveedor. El ajuste se间接amente refleja en el Total.

**Signos en cada fila:**
- Precio del Viaje (antes "Precio Acordado"): SIN signo
- Costo Proveedor: con **-**
- Costo Viaje: con **-**
- Gastos: con **-**
- Anticipos: con **+**
- Total: +/- según corresponda

## 2. Dropdown imprimir — no se ve el texto
El botón del dropdown solo muestra el ícono Printer + ChevronDown pero no el texto. Falta agregar texto al botón o al dropdown.

**Solución:** No es necesario texto en el botón (es un icon button). El problema es que el dropdown items sí tienen texto. Verificar que los items del dropdown sean visibles (puede ser un tema de color de fondo/texto).

## 3. Hoja de ruta — simplificar
**Quitar:**
- Campo "Cálculo" de la tabla de tarifa (dejar solo Esquema Tarifa + resultado)
- Ambos campos de firma (Firma Chofer / Encargado y Sello Operaciones / TAG)
- Sección "Gastos de Viaje"
- Sección "Anticipos entregados"

**Estos van al nuevo imprimible "Detalle de Viaje"** (ya creado, verificar que los tenga).

## 4. Imprimibles — Cliente, CUIT y Nro de Documento más grandes
En todos los 5 imprimibles:
- Cliente y CUIT deben ir con fontSize más grande
- Agregar **Nro del Documento asociado** al viaje (remito, carta de porte, etc.)
- El Nro del documento debe ser dinámico según el tipo de documento del viaje

**Archivos afectados:** PrintReceipt, PrintDocumentVoucher, PrintTripSheet, PrintSelectedTable, PrintLiquidacionSheet, PrintTripDetail

**Dados disponibles:** `viaje.documento?.numero` y `viaje.documento?.tipo`

## 5. Dropdown de estado — no se ven las etiquetas
El texto de los estados en el dropdown no es visible. Probablemente el color del texto coincide con el fondo.

**Solución:** Verificar que el color del texto de los botones del dropdown sea visible. Puede ser que `textTransform: 'capitalize'` con `en_curso` muestre "En_curso" en vez de "En curso". Usar un label display amigable.

## 6. Liquidaciones — no se ven
No hay liquidaciones creadas. Necesita crear al menos una de ejemplo.

**Solución:** Crear una liquidación de prueba desde la UI, o agregar datos de prueba en el seeder.

---

# Plan de correcciones

### Paso 1: Finanzas — fix signos y costo proveedor
**Archivo:** `Trips.jsx`, tab Finanzas (right-side card)
- Cambiar `costoProveedorAjustado` por `costoProveedorBase` (el raw)
- Agregar prefijo `-` a: Costo Proveedor, Costo Viaje, Gastos
- Agregar prefijo `+` a: Anticipos
- Sin signo a: Precio del Viaje
- Renombrar "Precio Acordado" → "Precio del Viaje"

### Paso 2: Dropdown imprimir — fix visibilidad texto
**Archivo:** `Trips.jsx`, dropdown items
- Verificar color de texto en los items del dropdown
- Puede ser que el `color` heredado no sea visible sobre el fondo

### Paso 3: Hoja de ruta — simplificar
**Archivo:** `Trips.jsx`, componente `PrintTripSheet`
- Quitar cálculo de tarifa (fila con `${formatCurrency(viaje.tarifa_valor)} x ${viaje.tarifa_base} = ${formatCurrency(viaje.precio_pactado)}`)
- Quitar ambas firmas al final
- Quitar sección "Gastos de Viaje"
- Quitar sección "Anticipos entregados"

### Paso 4: Imprimibles — Cliente/CUIT más grande + Nro Documento
**Archivos:** Todos los 6 imprimibles
- Aumentar fontSize de Cliente y CUIT
- Agregar campo "Documento: {tipo} N° {numero}" usando `viaje.documento?.tipo` y `viaje.documento?.numero`
- En PrintLiquidacionSheet, el documento viene de cada viaje individual

### Paso 5: Dropdown estado — fix visibilidad labels
**Archivo:** `Trips.jsx` y `Settlements.jsx`
- Los estados como `en_curso` se muestran como "en_curso" — cambiar a labels amigables: "En Curso", "Finalizado", etc.
- Verificar color de texto visible

### Paso 6: Crear liquidación de ejemplo
- Crear una liquidación de prueba desde la UI o con seeder
