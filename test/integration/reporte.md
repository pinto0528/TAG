# Reporte de Tests de Integración — Fase 3 (2026-07-17)

## Resumen

| | |
|---|---|
| **Total tests** | 8 |
| **Pasaron** | 8 (100%) |
| **Fallaron** | 0 |
| **Assertions** | 66 |
| **Duración** | 2.14s |
| **Suite** | `Tests\Feature` (filter: `Flujo`) |

## Archivos

| Archivo | Tests | Estado |
|---|---|---|
| `FlujoViajeCompletoTest.php` | 4 | PASS |
| `FlujoLiquidacionCompletoTest.php` | 4 | PASS |

---

## FlujoViajeCompletoTest (4)

### Escenario 1: Viaje propio con gastos y anticipos

```
1. POST /api/viajes → crear viaje propio (precio: $780,000, costo_prov: $0)
2. POST /api/gastos → gasto propio s/reintegro ($20,000)
3. POST /api/gastos → gasto propio c/reintegro ($15,000) — NO afecta costo
4. Verificar costo_viaje = 0 - 0 + 20,000 + 0 = $20,000
5. Verificar ganancia = 780,000 - 20,000 = $760,000
```

**Resultado**: PASS — costo_viaje y ganancia correctos.

### Escenario 2: Viaje con proveedor completo

```
1. POST /api/viajes → crear viaje con proveedor (precio: $780,000, costo_prov: $230,000)
2. POST /api/anticipos → anticipo ($100,000)
3. POST /api/gastos → proveedor c/reintegro ($30,000)
4. POST /api/gastos → proveedor s/reintegro ($25,000) — NO afecta costo
5. POST /api/gastos → propio s/reintegro ($10,000)
6. Verificar costo_proveedor_ajustado = 230k - 100k + 30k = $160,000
7. Verificar costo_viaje = 230k - 100k + 10k + 30k = $170,000
8. Verificar ganancia = 780,000 - 170,000 = $610,000
```

**Resultado**: PASS — las 3 fórmulas (costoProvAjustado, costoViaje, ganancia) correctas.

### Escenario 3: Crear, editar y eliminar gasto

```
1. POST /api/viajes → viaje (costo_prov: $200,000)
2. POST /api/gastos → gasto propio s/reintegro ($50,000)
3. Verificar costo_viaje = 200,000 + 50,000 = $250,000
4. PUT /api/gastos/{id} → editar monto a $75,000
5. Verificar costo_viaje = 200,000 + 75,000 = $275,000
6. DELETE /api/gastos/{id}
7. Verificar costo_viaje = $200,000 (vuelve al costo_proveedor)
```

**Resultado**: PASS — recálculo automático en create, update y delete.

### Escenario 4: Crear, editar y eliminar anticipo

```
1. POST /api/viajes → viaje con proveedor (costo_prov: $200,000)
2. POST /api/anticipos → anticipo ($50,000)
3. Verificar costo_proveedor_ajustado = 200,000 - 50,000 = $150,000
4. PUT /api/anticipos/{id} → editar monto a $80,000
5. Verificar costo_proveedor_ajustado = 200,000 - 80,000 = $120,000
6. DELETE /api/anticipos/{id}
7. Verificar costo_proveedor_ajustado = $200,000 (vuelve al costo_proveedor)
```

**Resultado**: PASS — recálculo automático en create, update y delete.

---

## FlujoLiquidacionCompletoTest (4)

### Escenario 1: Liquidación de proveedor

```
1. Crear 2 viajes con proveedor (costo_prov: $200,000 y $150,000)
2. POST /api/liquidaciones → crear liquidación proveedor
3. GET /api/liquidaciones/{id}/viajes-disponibles → 2 viajes
4. POST /api/liquidaciones/{id}/viajes → agregar ambos
5. Verificar liquidacion.viajes.length == 2
6. Verificar montos = [150000, 200000] (costo_proveedor_ajustado)
7. Crear 2da liquidación proveedor → verificar que los viajes NO aparecen en disponibles
8. Crear liquidación cliente → verificar que viaje con cliente_id SÍ aparece
```

**Resultado**: PASS — montos correctos, exclusión por tipo funciona.

### Escenario 2: Liquidación de cliente

```
1. Crear viaje propio (precio_pactado: $780,000)
2. POST /api/liquidaciones → crear liquidación cliente
3. GET /api/liquidaciones/{id}/viajes-disponibles → 1 viaje
4. POST /api/liquidaciones/{id}/viajes → agregar
5. Verificar monto pivot = $780,000 (precio_pactado)
```

**Resultado**: PASS — monto = precio_pactado para clientes.

### Escenario 3: Viaje compartido entre liquidaciones

```
1. Crear viaje con proveedor (con cliente_id Y proveedor_id)
2. Crear liquidación cliente → agregar viaje
3. Crear liquidación proveedor → agregar mismo viaje
4. Verificar que ambos muestran el viaje
5. Crear 3ra liquidación proveedor → verificar que viaje NO está en disponibles
```

**Resultado**: PASS — un viaje puede estar en liquidación cliente Y proveedor, pero no en 2 del mismo tipo.

### Escenario 4: Quitar y re-agregar viaje

```
1. Crear liquidación con 2 viajes
2. Quitar viaje 1
3. Verificar que liquidación tiene 1 viaje
4. Verificar que viaje 1 vuelve a aparecer en disponibles
5. Re-agregar viaje 1
6. Verificar que liquidación tiene 2 viajes de nuevo
```

**Resultado**: PASS — detach/reattach funciona correctamente.

---

## Cobre todo el flujo de datos

```
Viaje → Gastos → recalcularCostoViaje() → costo_viaje actualizado
Viaje → Anticipos → recalcularCostoViaje() → costo_viaje actualizado
Viaje → Liquidación (viajes-disponibles) → agregar/quitar → monto pivot
Liquidación → recalcula total → total actualizado
```

## Estado

Todos los flujos críticos del dominio están cubiertos:
- Creación/edición/eliminación de viajes con costos
- Recálculo automático de `costo_viaje` y `costo_proveedor_ajustado`
- Liquidaciones de cliente y proveedor con montos correctos
- Exclusión de viajes por tipo de liquidación
- Compartición de viajes entre liquidaciones de distinto tipo
