# Fase 5: Ejecución de Tests

## Comandos

### Reset de base de datos

```bash
cd api
php artisan migrate:fresh --seed --force
```

### Ejecutar todos los tests

```bash
cd api
php artisan test
```

### Ejecutar por suite

```bash
# Solo unit tests
php artisan test --testsuite=Unit

# Solo feature tests
php artisan test --testsuite=Feature
```

### Ejecutar por archivo

```bash
cd api
php artisan test --filter=ViajeCostoTest
php artisan test --filter=EstadoTransitionsTest
php artisan test --filter=AutoNumberingTest
php artisan test --filter=FlujoViajeCompletoTest
php artisan test --filter=FlujoLiquidacionCompletoTest
```

### Ejecutar un test específico

```bash
cd api
php artisan test --filter=ViajeCostoTest::test_costo_viaje_formula_basica
```

---

## Orden de ejecución sugerido

1. `php artisan migrate:fresh --seed --force` (reset DB)
2. `php artisan test --filter=ViajeCostoTest` (unit: fórmulas)
3. `php artisan test --filter=EstadoTransitionsTest` (unit: estados)
4. `php artisan test --filter=AutoNumberingTest` (unit: numeración)
5. `php artisan test --filter=FlujoViajeCompletoTest` (integration: viajes)
6. `php artisan test --filter=FlujoLiquidacionCompletoTest` (integration: liquidaciones)
7. `php artisan test --testsuite=Feature` (feature: endpoints)
8. `php artisan test` (correr todo de una)

---

## Troubleshooting

| Problema | Solución |
|---|---|
| SeaDrive colapsa PHP autoloader | Pausar SeaDrive antes de ejecutar tests |
| Tests fallan por datos previos | Ejecutar `migrate:fresh --seed` antes |
| Timeout en tests | Aumentar timeout en phpunit.xml o ejecutar tests individuales |
| SQLite no soporta某些 queries | Verificar que phpunit.xml usa `:memory:` |

---

## Cobertura mínima esperada

| Tipo | Tests | Estado esperado |
|---|---|---|
| Unit (fórmulas) | ~10 | Todos pasan |
| Unit (estados) | ~8 | Todos pasan |
| Unit (numeración) | ~5 | Todos pasan |
| Integration | ~12 | Todos pasan |
| Feature (CRUD) | ~100 | Todos pasan |
| Feature (especiales) | ~19 | Todos pasan |
| **Total** | **~154** | **100% pass** |
