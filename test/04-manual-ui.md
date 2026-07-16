# Fase 4: Testing Manual UI

Checklist para testing manual en el navegador. Ejecutar después de que los tests pasen.

---

## Viajes (`/trips`)

### CRUD
- [ ] Crear viaje propio (sin proveedor)
- [ ] Crear viaje con proveedor
- [ ] Editar viaje existente
- [ ] Cambiar estado: pendiente → en_curso
- [ ] Cambiar estado: en_curso → finalizado
- [ ] Cambiar estado: finalizado → cancelado
- [ ] Archivar viaje
- [ ] Restaurar viaje archivado

### Gastos
- [ ] Agregar gasto propio sin reintegro
- [ ] Agregar gasto propio con reintegro
- [ ] Agregar gasto proveedor sin reintegro
- [ ] Agregar gasto proveedor con reintegro
- [ ] Editar gasto
- [ ] Eliminar gasto
- [ ] Verificar que Finanzas tab se actualiza al agregar/eliminar gasto

### Anticipos
- [ ] Agregar anticipo
- [ ] Editar anticipo
- [ ] Eliminar anticipo
- [ ] Verificar que Finanzas tab se actualiza

### Documento
- [ ] Asociar documento (REMITO / CARTA_DE_PORTE / HOJA_DE_RUTA)
- [ ] Editar documento
- [ ] Subir archivo adjunto
- [ ] Eliminar archivo adjunto
- [ ] Verificar Documentation tab muestra archivos

### Finanzas Tab
- [ ] Precio del Viaje: monto sin signo
- [ ] Costo Proveedor: monto con signo negativo
- [ ] Anticipos: monto con signo positivo
- [ ] Gastos propios s/reintegro: monto con signo negativo
- [ ] Gastos propios c/reintegro: gris, no afecta total
- [ ] Gastos prov. s/reintegro: gris, no afecta total
- [ ] Gastos prov. c/reintegro: monto con signo negativo
- [ ] Total: sin signo, fórmula correcta

### Prints
- [ ] Print Hoja de Ruta: Cliente/CUIT/Documento con label bold
- [ ] Print Detalle de Viaje: mismo formato, monto total bold, sin + en gastos
- [ ] Print Comprobante de Gasto
- [ ] Print Comprobante de Anticipo

### Búsqueda y Filtros
- [ ] Buscar por código de viaje (P-XXXXX / T-XXXXX)
- [ ] Buscar por cliente
- [ ] Buscar por chofer
- [ ] Filtrar por rango de fechas
- [ ] Filtrar por estado
- [ ] Ordenar por columnas

---

## Liquidaciones (`/settlements`)

### Wizard
- [ ] Crear liquidación de proveedor (seleccionar viajes)
- [ ] Crear liquidación de cliente
- [ ] Verificar que viajes de la wizard son del tipo correcto
- [ ] Verificar montos editable en el paso 2
- [ ] Verificar numeración automática (LIQ-C-XXXX / LIQ-P-XXXX)

### Listado
- [ ] Filtrar por tipo (cliente/proveedor)
- [ ] Filtrar por rango de fechas
- [ ] Expandir detalle de viajes
- [ ] Verificar columnas: Código, Fecha, Ruta, Chofer/Unidad, Cliente (proveedor), Gastos, Anticipos, Monto

### Prints
- [ ] Print liquidación cliente: sin columnas Gastos/Anticipos
- [ ] Print liquidación proveedor: con columnas Gastos/Anticipos
- [ ] Verificar cabecera: Fecha, Nro, Cliente/Proveedor, CUIT

### Estados
- [ ] Cambiar estado: borrador → pendiente
- [ ] Cambiar estado: pendiente → facturada
- [ ] Verificar que viajes no desaparecen del listado

---

## Recursos (`/resources`)

### Choferes
- [ ] Crear chofer propio (sin proveedor)
- [ ] Crear chofer de proveedor
- [ ] Editar chofer
- [ ] Filtrar por proveedor
- [ ] Archivar / Restaurar

### Unidades
- [ ] Crear unidad propia
- [ ] Crear unidad de proveedor
- [ ] Editar unidad
- [ ] Filtrar por proveedor
- [ ] Archivar / Restaurar

---

## Clientes (`/clients`)

- [ ] Crear cliente
- [ ] Editar cliente
- [ ] Buscar por razón social
- [ ] Archivar / Restaurar

---

## Proveedores (`/providers`)

- [ ] Crear proveedor
- [ ] Editar proveedor
- [ ] Buscar por razón social
- [ ] Archivar / Restaurar

---

## Criterios de Aceptación

- Todos los tests PHPUnit pasan
- Fórmulas de costo verificadas con datos de prueba conocidos
- Prints muestran datos correctos (Cliente, CUIT, monospaced)
- Finanzas tab: números cuadran, gris para gastos que no afectan total
- Liquidaciones: viaje puede estar en cliente Y proveedor, pero no en dos del mismo tipo
