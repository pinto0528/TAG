# Fase 3: Tests de Integración (Flujos Completos)

Ubicación: `api/tests/Feature/`

Tests que validan cadenas completas de operaciones, no solo un endpoint aislado.

---

## 3.1 FlujoViajeCompletoTest.php

### Escenario: Viaje propio con gastos y anticipos

```
1. Crear cliente
2. Crear chofer propio
3. Crear unidad propia
4. Crear viaje propio (precio: $780,000, costo_prov: $0)
5. Agregar gasto propio s/reintegro ($20,000)
6. Agregar gasto propio c/reintegro ($15,000)
7. Agregar anticipo ($0)
8. Verificar costo_viaje = 0 - 0 + 20,000 + 0 = $20,000
9. Verificar ganancia = 780,000 - 20,000 = $760,000
```

### Escenario: Viaje con proveedor completo

```
1. Crear cliente
2. Crear proveedor
3. Crear chofer del proveedor
4. Crear unidad del proveedor
5. Crear viaje con proveedor (precio: $780,000, costo_prov: $230,000)
6. Agregar anticipo ($100,000)
7. Agregar gasto proveedor c/reintegro ($30,000)
8. Agregar gasto proveedor s/reintegro ($25,000)
9. Agregar gasto propio s/reintegro ($10,000)
10. Verificar costo_proveedor_ajustado = 230,000 - 100,000 + 30,000 = $160,000
11. Verificar costo_viaje = 230,000 - 100,000 + 10,000 + 30,000 = $170,000
12. Verificar ganancia = 780,000 - 170,000 = $610,000
```

### Escenario: Crear, editar y eliminar gasto

```
1. Crear viaje
2. Crear gasto ($50,000)
3. Verificar que costo_viaje se actualizó
4. Editar gasto ($75,000)
5. Verificar que costo_viaje se actualizó de nuevo
6. Eliminar gasto
7. Verificar que costo_viaje volvió al valor original
```

### Escenario: Crear, editar y eliminar anticipo

```
1. Crear viaje con proveedor (costo_prov: $200,000)
2. Crear anticipo ($50,000)
3. Verificar costo_proveedor_ajustado = 200,000 - 50,000 = $150,000
4. Editar anticipo ($80,000)
5. Verificar costo_proveedor_ajustado = 200,000 - 80,000 = $120,000
6. Eliminar anticipo
7. Verificar costo_proveedor_ajustado = $200,000
```

---

## 3.2 FlujoLiquidacionCompletoTest.php

### Escenario: Liquidación de proveedor

```
1. Crear viaje 1 con proveedor (costo_prov: $200,000)
2. Crear viaje 2 con proveedor (costo_prov: $150,000)
3. Crear liquidacion tipo=proveedor
4. GET viajes-disponibles → debe mostrar viaje 1 y 2
5. POST agregar viajes [viaje1, viaje2]
6. Verificar que liquidacion.viajes.length == 2
7. Verificar montos del pivot (costo_proveedor_ajustado de cada viaje)
8. Verificar que viaje 1 ya NO aparece en viajes-disponibles de otra liquidación proveedor
9. Verificar que viaje 1 SÍ aparece en viajes-disponibles de liquidación cliente
```

### Escenario: Liquidación de cliente

```
1. Crear viaje propio (precio_pactado: $780,000)
2. Crear liquidacion tipo=cliente
3. GET viajes-disponibles → debe mostrar viaje propio
4. POST agregar viajes [viaje]
5. Verificar monto del pivot = precio_pactado ($780,000)
```

### Escenario: Viaje compartido entre liquidaciones

```
1. Crear viaje con proveedor
2. Crear liquidacion cliente → agregar viaje
3. Crear liquidacion proveedor → agregar mismo viaje
4. Verificar que ambos muestran el viaje
5. Verificar que un TERCER viaje en liquidación proveedor NO puede agregar el mismo viaje
```

### Escenario: Quitar y re-agregar viaje

```
1. Crear liquidacion con 2 viajes
2. Quitar viaje 1
3. Verificar que liquidacion tiene 1 viaje
4. Verificar que viaje 1 vuelve a aparecer en viajes-disponibles
5. Re-agregar viaje 1
6. Verificar que liquidacion tiene 2 viajes de nuevo
```

---

## Ejecución

```bash
cd api
php artisan test --filter=FlujoViajeCompletoTest
php artisan test --filter=FlujoLiquidacionCompletoTest
```
