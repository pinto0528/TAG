# Plan: Gastos/Anticipos + Costo Viaje

## Matriz de reglas

| Clase | Reintegro | → Costo Proveedor | → Costo Viaje |
|---|---|---|---|
| Propio | con reintegro | **- resta** | no suma |
| Propio | sin reintegro | no affect | **+ suma** |
| Tercerizado | con reintegro | **+ suma** | **+ suma** |
| Tercerizado | sin reintegro | no affect | no suma |

**Anticipos:** siempre restan del costo proveedor.

**Fórmulas:**
```
costo_proveedor_ajustado = costo_proveedor_base - totalAnticipos - (propio_con_reintegro) + (tercerizado_con_reintegro)

costo_viaje = costo_proveedor_ajustado + (propio_sin_reintegro) + (tercerizado_con_reintegro)
```

## Archivos a modificar

- `api/database/migrations/2026_07_13_000009_add_clase_reintegro_to_gastos_and_costo_viaje_to_viajes.php` — **nuevo**
- `api/app/Models/Gasto.php` — agregar `clase`, `reintegro` a $fillable
- `api/app/Models/Viaje.php` — agregar `costo_viaje` a $fillable + método `recalcularCostoViaje()`
- `api/app/Http/Controllers/GastoController.php` — validar `clase` y `reintegro`, llamar recalc
- `api/app/Http/Controllers/AnticipoController.php` — llamar recalc en store/update/destroy/restore
- `client/src/pages/Trips.jsx` — FinanceForm: campos clase/reintegro; Finanzas tab: mostrar costo_viaje y costo_proveedor ajustado

## Pasos

1. Migration: add `clase` (string nullable) + `reintegro` (boolean default false) to gastos; add `costo_viaje` (decimal 12,2 default 0) to viajes
2. Model updates: Gasto $fillable, Viaje $fillable + recalcularCostoViaje()
3. Controller updates: validación + recalc automático
4. Frontend FinanceForm: dos campos nuevos (clase select, reintegro select)
5. Frontend Finanzas tab: mostrar costo_viaje + costo_proveedor ajustado
6. Verificar: migrate + build + prueba manual
