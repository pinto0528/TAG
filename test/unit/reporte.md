# Reporte de Tests Unitarios — 2026-07-17

## Resumen

| | |
|---|---|
| **Total tests** | 26 |
| **Pasaron** | 26 (100%) |
| **Fallaron** | 0 |
| **Duración** | 2.38s |
| **Suite** | `Tests\Unit` |

## Archivos

| Archivo | Tests | Estado |
|---|---|---|
| `AutoNumberingTest.php` | 5 | PASS |
| `EstadoTransitionsTest.php` | 8 | PASS |
| `ViajeCostoTest.php` | 12 | PASS |
| `ExampleTest.php` | 1 | PASS |

## Detalle por Test

### AutoNumberingTest (5)

| # | Test | Estado |
|---|---|---|
| 1 | viaje codigo propio (P-XXXXX) | PASS |
| 2 | viaje codigo proveedor (T-XXXXX) | PASS |
| 3 | viaje nro sequential (nro_viaje) | PASS |
| 4 | liquidacion numero cliente (LIQ-C-XXXX) | PASS |
| 5 | liquidacion numero proveedor (LIQ-P-XXXX) | PASS |

### EstadoTransitionsTest (8)

| # | Test | Estado |
|---|---|---|
| 1 | viaje estado default es pendiente | PASS |
| 2 | viaje cambiar a en_curso | PASS |
| 3 | viaje cambiar a finalizado | PASS |
| 4 | viaje cambiar a cancelado | PASS |
| 5 | viaje cualquier estado a cualquier estado | PASS |
| 6 | liquidacion estado default es borrador | PASS |
| 7 | liquidacion cambiar estado | PASS |
| 8 | liquidacion cualquier estado a cualquier estado | PASS |

### ViajeCostoTest (12)

| # | Test | Fórmula | Estado |
|---|---|---|---|
| 1 | costo_proveedor_ajustado formula basica | 230k - 100k + 30k = 160k | PASS |
| 2 | costo_proveedor_ajustado con cero anticipos | 200k - 0 + 25k = 225k | PASS |
| 3 | costo_proveedor_ajustado con cero gastos | 150k - 50k + 0 = 100k | PASS |
| 4 | costo_proveedor_ajustado propio reintegro no afecta | 200k - 0 + 0 = 200k | PASS |
| 5 | costo_viaje formula basica | 230k - 100k + 10k + 30k = 170k | PASS |
| 6 | costo_viaje con cero anticipos | 200k - 0 + 20k + 0 = 220k | PASS |
| 7 | costo_viaje con cero gastos | 180k - 60k + 0 + 0 = 120k | PASS |
| 8 | costo_viaje gastos mixed | 300k - 100k + 15k + 40k = 255k | PASS |
| 9 | costo_viaje propio s/reintegro afecta | 100k - 0 + 30k + 0 = 130k | PASS |
| 10 | costo_viaje proveedor s/reintegro no afecta | 100k - 0 + 0 + 0 = 100k | PASS |
| 11 | recalcular costo viaje persiste | Verifica save en DB | PASS |
| 12 | ganancia formula | 780k - 170k = 610k | PASS |

## Correcciones aplicadas

Los tests originales tenían 10 errores que fueron corregidos:

1. **`anticipos.concepto` NOT NULL** — El campo `concepto` es obligatorio en la migración. Se agregó `'concepto' => 'Test anticipo'` al helper `crearAnticipo()`.

2. **`liquidaciones.numero` UNIQUE** — El test creaba 2 liquidaciones con el mismo número `LIQ-C-0001`. Se cambiaron a números únicos (`LIQ-C-0100`, `LIQ-C-0101`).

3. **`costo_viaje` null** — El campo `costo_viaje` es una columna de DB que solo se calcula al llamar `recalcularCostoViaje()`. Los tests creaban gastos directamente sin pasar por el controller. Se agregó `recalcularCostoViaje()` explícito en cada test que verifica `costo_viaje`.

## Ubicación

Los tests están en `api/tests/Unit/` (requerido por `phpunit.xml`).

Los originales en `test/unit/` son un respaldo — no los ejecuta PHPUnit.
