# Fase 1: Tests Unitarios Backend

Ubicación: `api/tests/Unit/`

## 1.1 ViajeCostoTest.php

Tests de las fórmulas de cálculo de costos en `Viaje.php`.

### Fórmulas actuales

```
costo_proveedor_ajustado = costoProveedor - anticipos + terceroReintegro
costo_viaje = costoProveedor - anticipos + propioSinReintegro + terceroReintegro
ganancia = precio_pactado - costo_viaje
```

### Tests

| # | Test | Qué valida |
|---|---|---|
| 1 | `test_costo_viaje_formula_basica` | Fórmula con 1 anticipo + 1 gasto propio s/reintegro |
| 2 | `test_costo_proveedor_ajustado_formula` | Fórmula: costoProv - anticipos + terceroReintegro |
| 3 | `test_costo_con_cero_anticipos` | Cuando no hay anticipos, costo_ajustado = costoProveedor + terceroReintegro |
| 4 | `test_costo_con_cero_gastos` | Cuando no hay gastos, costo_viaje = costoProveedor - anticipos |
| 5 | `test_costo_gastos_mixed` | Combinación: propio c/reintegro + propio s/reintegro + proveedor c/reintegro + proveedor s/reintegro |
| 6 | `test_costo_proveedor_s_reintegro_no_afecta` | Gasto proveedor s/reintegro NO cambia costo_viaje |
| 7 | `test_costo_propio_c_reintegro_no_afecta` | Gasto propio c/reintegro NO cambia costo_viaje |
| 8 | `test_recalcular_costo_viaje_persiste` | `recalcularCostoViaje()` guarda correctamente en BD |
| 9 | `test_costo_viaje_accessor` | El accessor `costo_proveedor_ajustado` retorna valor correcto |
| 10 | `test_ganancia_formula` | ganancia = precio_pactado - costo_viaje |

### Datos de prueba (crear en cada test)

```php
$viaje = Viaje::create([
    'chofer_id' => $chofer->id,
    'cliente_id' => $cliente->id,
    'proveedor_id' => $proveedor->id,
    'origen' => 'CABA',
    'destino' => 'Rosario',
    'fecha_salida' => '2026-07-15',
    'precio_pactado' => 780000,
    'costo_proveedor' => 230000,
]);
```

---

## 1.2 EstadoTransitionsTest.php

Tests de transiciones de estado para Viaje y Liquidacion.

### Tests

| # | Test | Qué valida |
|---|---|---|
| 1 | `test_viaje_estado_default` | Nuevo viaje tiene estado `pendiente` |
| 2 | `test_viaje_cambiar_a_en_curso` | PATCH estado → `en_curso` funciona |
| 3 | `test_viaje_cambiar_a_finalizado` | PATCH estado → `finalizado` funciona |
| 4 | `test_viaje_cambiar_a_cancelado` | PATCH estado → `cancelado` funciona |
| 5 | `test_viaje_cualquier_estado_a_cualquier_estado` | No hay restricciones de transición |
| 6 | `test_liquidacion_estado_default` | Nueva liquidacion tiene estado `borrador` |
| 7 | `test_liquidacion_cambiar_estado` | PUT estado → `pendiente` / `facturada` |
| 8 | `test_liquidacion_cualquier_estado_a_cualquier_estado` | Sin restricciones |

---

## 1.3 AutoNumberingTest.php

Tests de numeración automática.

### Tests

| # | Test | Qué valida |
|---|---|---|
| 1 | `test_viaje_nro_propio` | Código empieza con `P-` |
| 2 | `test_viaje_nro_proveedor` | Código empieza con `T-` |
| 3 | `test_viaje_nro_sequential` | IDs incrementales |
| 4 | `test_liquidacion_numero_cliente` | Formato `LIQ-C-XXXX` |
| 5 | `test_liquidacion_numero_proveedor` | Formato `LIQ-P-XXXX` |

---

## Ejecución

```bash
cd api
php artisan test --filter=ViajeCostoTest
php artisan test --filter=EstadoTransitionsTest
php artisan test --filter=AutoNumberingTest
```
