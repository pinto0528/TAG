# Reporte de Tests Feature + Integración — 2026-07-17

## Resumen

| | |
|---|---|
| **Total tests** | 58 |
| **Pasaron** | 58 (100%) |
| **Fallaron** | 0 |
| **Duración** | ~3s |
| **Suite** | `Tests\Feature` |

## Archivos

| Archivo | Tests | Tipo | Estado |
|---|---|---|---|
| `ViajeApiTest.php` | 12 | Feature | PASS |
| `LiquidacionApiTest.php` | 21 | Feature | PASS |
| `DocumentoApiTest.php` | 7 | Feature | PASS |
| `GastoApiTest.php` | 9 | Feature | PASS |
| `FlujoViajeCompletoTest.php` | 4 | Integración | PASS |
| `FlujoLiquidacionCompletoTest.php` | 4 | Integración | PASS |

---

## Detalle por Archivo

### ViajeApiTest (12)

| # | Test | Qué valida | Estado |
|---|---|---|---|
| 1 | cambiar estado viaje | PATCH `/api/viajes/{id}/estado` → 200 | PASS |
| 2 | cambiar estado invalido | Estado inexistente → 422 | PASS |
| 3 | index lista viajes | GET `/api/viajes` → paginado, 2 resultados | PASS |
| 4 | store crea viaje | POST `/api/viajes` → 201, creado en DB | PASS |
| 5 | store validacion campos requeridos | POST vacío → 422 | PASS |
| 6 | show retorna viaje | GET `/api/viajes/{id}` → 200 | PASS |
| 7 | show no existe | GET `/api/viajes/99999` → 404 | PASS |
| 8 | update modifica viaje | PUT `/api/viajes/{id}` → 200 | PASS |
| 9 | destroy soft delete | DELETE → soft deleted en DB | PASS |
| 10 | index no muestra eliminados | Solo muestra no-eliminados | PASS |
| 11 | restore recupera viaje | POST restore → restaurado | PASS |
| 12 | store con unidades | POST con `unidades: [id1, id2]` → 2 unidades en pivot | PASS |

### LiquidacionApiTest (21)

| # | Test | Qué valida | Estado |
|---|---|---|---|
| 1 | viajes disponibles tipo cliente | Solo muestra viajes del cliente de la liquidación | PASS |
| 2 | viajes disponibles excluye cancelados | No muestra viajes cancelados | PASS |
| 3 | viajes disponibles tipo proveedor | Solo muestra viajes del proveedor de la liquidación | PASS |
| 4 | viajes disponibles excluye mismo tipo | No muestra viajes ya en otra liquidación del mismo tipo | PASS |
| 5 | viajes disponibles permite otro tipo | SÍ muestra viajes en liquidación de tipo diferente | PASS |
| 6 | agregar viajes a liquidacion | POST viajes → attached en pivot con monto | PASS |
| 7 | agregar viajes recalcula total | Total = suma de montos | PASS |
| 8 | agregar viajes estado no borrador | Solo permite en estado borrador → 422 | PASS |
| 9 | quitar viaje de liquidacion | DELETE → detached de pivot | PASS |
| 10 | actualizar monto pivot | PUT monto → actualizado en pivot y total | PASS |
| 11 | cambiar estado liquidacion | PUT estado → 200 | PASS |
| 12 | cambiar estado invalido | Estado inexistente → 422 | PASS |
| 13 | store crea liquidacion cliente | POST → 201, tipo=cliente | PASS |
| 14 | store crea liquidacion proveedor | POST → 201, tipo=proveedor | PASS |
| 15 | store cliente requiere cliente_id | Sin cliente_id → 422 | PASS |
| 16 | store proveedor requiere proveedor_id | Sin proveedor_id → 422 | PASS |
| 17 | store con viajes | POST con `viaje_ids` → viajes attached | PASS |
| 18 | show retorna liquidacion | GET → 200 con viajes | PASS |
| 19 | show no existe | GET 99999 → 404 | PASS |
| 20 | destroy soft delete | DELETE → soft deleted | PASS |
| 21 | restore recupera liquidacion | POST restore → restaurado | PASS |

### DocumentoApiTest (7)

| # | Test | Qué valida | Estado |
|---|---|---|---|
| 1 | store archivo | POST archivo → 201, guardado en DB | PASS |
| 2 | store archivo tipo invalido | .exe → 422 | PASS |
| 3 | destroy archivo | DELETE archivo → eliminado | PASS |
| 4 | store crea documento | POST → 201 | PASS |
| 5 | store validacion | POST sin campos → 422 | PASS |
| 6 | show retorna documento | GET → 200 | PASS |
| 7 | destroy soft delete | DELETE → soft deleted | PASS |

### GastoApiTest (9)

| # | Test | Qué valida | Estado |
|---|---|---|---|
| 1 | gasto clase propio | POST clase=propio → 201 | PASS |
| 2 | gasto clase proveedor | POST clase=proveedor → 201 | PASS |
| 3 | gasto clase invalida | POST clase=tercerizado → 422 | PASS |
| 4 | gasto recalcula viaje | Después de crear gasto propio, costo_viaje = costoProv + monto | PASS |
| 5 | gasto update recalcula viaje | Después de editar monto, costo_viaje se recalcula | PASS |
| 6 | gasto destroy recalcula viaje | Después de eliminar gasto, costo_viaje = costoProv | PASS |
| 7 | index lista gastos | GET → lista | PASS |
| 8 | show retorna gasto | GET → 200 | PASS |
| 9 | destroy soft delete | DELETE → soft deleted | PASS |

### FlujoViajeCompletoTest — Integración (4)

| # | Escenario | Qué valida | Estado |
|---|---|---|---|
| 1 | Viaje propio con gastos y anticipos | Flujo completo: crear viaje → gastos propio s/reintegro y c/reintegro → verificar costo_viaje y ganancia | PASS |
| 2 | Viaje con proveedor completo | Crear viaje con proveedor → anticipo → gastos proveedor c/reintegro, proveedor s/reintegro, propio s/reintegro → verificar costo_proveedor_ajustado, costo_viaje, ganancia | PASS |
| 3 | Crear, editar y eliminar gasto | CRUD de gasto → recálculo automático en cada operación | PASS |
| 4 | Crear, editar y eliminar anticipo | CRUD de anticipo → recálculo automático de costo_proveedor_ajustado | PASS |

### FlujoLiquidacionCompletoTest — Integración (4)

| # | Escenario | Qué valida | Estado |
|---|---|---|---|
| 1 | Liquidación de proveedor | Crear viajes → liquidación proveedor → agregar viajes → verificar montos = costo_proveedor_ajustado → verificar exclusión por tipo | PASS |
| 2 | Liquidación de cliente | Crear viaje propio → liquidación cliente → agregar viaje → verificar monto = precio_pactado | PASS |
| 3 | Viaje compartido entre liquidaciones | Mismo viaje en liquidación cliente Y proveedor → verificar que no se duplica en mismo tipo | PASS |
| 4 | Quitar y re-agregar viaje | Agregar 2 viajes → quitar uno → verificar que vuelve a disponibles → re-agregar | PASS |

---

## Bug encontrado y corregido

### LiquidacionController::agregarViajes — monto default para proveedor

**Archivo**: `api/app/Http/Controllers/LiquidacionController.php`

**Problema**: El método `agregarViajes()` usaba `precio_pactado` como monto default para todos los tipos de liquidación. Para liquidaciones de proveedor, debería usar `costo_proveedor_ajustado`.

**Antes**:
```php
$monto = $item['monto'] ?? $viaje->precio_pactado;
```

**Después**:
```php
$monto = $item['monto'] ?? ($liquidacion->tipo === 'proveedor'
    ? ($viaje->costo_proveedor_ajustado ?? $viaje->costo_viaje ?? 0)
    : $viaje->precio_pactado);
```

**Impacto**: Los montos de las liquidaciones de proveedor ahora se calculan correctamente al agregar viajes sin monto explícito.

---

## Correcciones aplicadas durante desarrollo

Los tests tuvieron 8 errores iniciales que fueron corregidos:

1. **`anticipos.concepto` NOT NULL** — El campo `concepto` es NOT NULL en la migración. Se agregó `'concepto'` a los anticipo POST en `FlujoViajeCompletoTest`.

2. **`liquidaciones.numero` UNIQUE** — El helper `crearLiquidacion()` hardcodeaba `LIQ-C-0001`. Se cambió a auto-incrementar con `LIQ-TEST-NNNN`.

3. **`costo_viaje` null (GastoApiTest)** — Los tests creaban gastos via modelo directo sin trigger `recalcularCostoViaje()`. Se cambió a crear vía API.

4. **Costo formula (FlujoViajeCompletoTest)** — El test asumía `costoOriginal=0` pero `costo_viaje = costo_proveedor + gastos`. Se corrigieron las expectativas.

5. **Costo after delete (GastoApiTest)** — Después de eliminar todos los gastos, `costo_viaje = costo_proveedor`, no `0`.

6. **GD extension (DocumentoApiTest)** — `UploadedFile::fake()->image()` requiere GD. Se cambió a `->create()` con PDF.

7. **Monto default proveedor** — `agregarViajes()` usaba `precio_pactado` para proveedor. Se corrigió a `costo_proveedor_ajustado`.

---

## Cobertura

| Domain | Resources testeados | Tests |
|---|---|---|
| Viajes | CRUD + estado + multi-unidad | 12 |
| Liquidaciones | CRUD + viajes-disponibles + agregar/quitar + monto pivot | 21 |
| Documentos | CRUD + archivos upload/delete | 7 |
| Gastos | CRUD + clase validation + recálculo automático | 9 |
| Integración | Flujos completos viaje y liquidación | 8 |

**Total**: 58 tests, ~130 assertions
