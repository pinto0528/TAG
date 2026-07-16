# Fase 2: Tests de API (Feature)

Ubicación: `api/tests/Feature/`

## 2.1 CRUD Tests

Tests genéricos para cada resource. Usar traits o base class para reutilizar.

### Resources a testear (10)

| Resource | Ruta | Validaciones clave |
|---|---|---|
| viajes | `/api/viajes` | chofer_id, cliente_id, origen, destino, fecha_salida |
| clientes | `/api/clientes` | razon_social, cuit |
| proveedores | `/api/proveedores` | razon_social, cuit |
| choferes | `/api/choferes` | nombre, apellido, proveedor_id (opcional) |
| unidades | `/api/unidades` | patente, proveedor_id (opcional) |
| gastos | `/api/gastos` | viaje_id, tipo, clase, reintegro, monto, fecha |
| anticipos | `/api/anticipos` | viaje_id, monto, fecha |
| documentos | `/api/documentos` | viaje_id, tipo, numero |
| liquidaciones | `/api/liquidaciones` | tipo, fecha_emision |
| facturas | `/api/facturas` | liquidacion_id, numero, monto_total |

### Tests por resource (×10)

| # | Test | Método | Esperado |
|---|---|---|---|
| 1 | `test_index_lista_con_paginacion` | GET /api/{resource} | 200, data[], meta |
| 2 | `test_index_filtro_search` | GET /api/{resource}?search=... | 200, filtered results |
| 3 | `test_store_crea_registro` | POST /api/{resource} | 201, data |
| 4 | `test_store_validacion_campos_requeridos` | POST /api/{resource} (vacío) | 422, errors |
| 5 | `test_show_retorna_registro` | GET /api/{resource}/{id} | 200, data |
| 6 | `test_show_no_existe` | GET /api/{resource}/99999 | 404 |
| 7 | `test_update_modifica_registro` | PUT /api/{resource}/{id} | 200, data |
| 8 | `test_destroy_soft_delete` | DELETE /api/{resource}/{id} | 200 |
| 9 | `test_index_no_muestra_eliminados` | GET /api/{resource} | No incluye el eliminado |
| 10 | `test_restore_recupera_registro` | POST /api/{resource}/{id}/restore | 200 |

**Total**: ~100 tests (10 resources × 10 tests)

---

## 2.2 Endpoints Especiales

### Viajes

| # | Test | Método | Ruta | Qué valida |
|---|---|---|---|---|
| 1 | `test_cambiar_estado_viaje` | PATCH | `/api/viajes/{id}/estado` | Cambia estado, respuesta 200 |
| 2 | `test_cambiar_estado_invalido` | PATCH | `/api/viajes/{id}/estado` | Estado inválido → 422 |

### Liquidaciones

| # | Test | Método | Ruta | Qué valida |
|---|---|---|---|---|
| 3 | `test_viajes_disponibles_tipo_cliente` | GET | `/api/liquidaciones/{id}/viajes-disponibles` | Solo viajes para cliente |
| 4 | `test_viajes_disponibles_tipo_proveedor` | GET | `/api/liquidaciones/{id}/viajes-disponibles` | Solo viajes para proveedor |
| 5 | `test_viajes_disponibles_excluye_mismo_tipo` | GET | `/api/liquidaciones/{id}/viajes-disponibles` | No incluye viajes en otra liquidación del mismo tipo |
| 6 | `test_viajes_disponibles_permite_otro_tipo` | GET | `/api/liquidaciones/{id}/viajes-disponibles` | SÍ incluye viajes en liquidación de tipo diferente |
| 7 | `test_agregar_viajes_a_liquidacion` | POST | `/api/liquidaciones/{id}/viajes` | Agrega viajes con monto calculado |
| 8 | `test_quitar_viaje_de_liquidacion` | DELETE | `/api/liquidaciones/{id}/viajes/{viajeId}` | Quita viaje |
| 9 | `test_actualizar_monto_pivot` | PUT | `/api/liquidaciones/{id}/viajes/{viajeId}/monto` | Actualiza monto |
| 10 | `test_cambiar_estado_liquidacion` | PUT | `/api/liquidaciones/{id}/estado` | Cambia estado |
| 11 | `test_no_duplicar_viaje_en_mismo_tipo` | POST | `/api/liquidaciones/{id}/viajes` | Error si viaje ya está en liquidación del mismo tipo |

### Documentos

| # | Test | Método | Ruta | Qué valida |
|---|---|---|---|---|
| 12 | `test_store_archivo` | POST | `/api/documentos/{id}/archivos` | Sube archivo (jpg/png/pdf, max 10MB) |
| 13 | `test_store_archivo_tipo_invalido` | POST | `/api/documentos/{id}/archivos` | Rechaza .exe, .txt, etc. |
| 14 | `test_destroy_archivo` | DELETE | `/api/documentos/{docId}/archivos/{archivoId}` | Elimina archivo |

### Gastos (validaciones)

| # | Test | Método | Qué valida |
|---|---|---|---|
| 15 | `test_gasto_clase_propio` | POST | Acepta `propio` |
| 16 | `test_gasto_clase_cliente` | POST | Acepta `cliente` |
| 17 | `test_gasto_clase_proveedor` | POST | Acepta `proveedor` |
| 18 | `test_gasto_clase_invalida` | POST | Rechaza `tercerizado`, `otro` |
| 19 | `test_gasto_recalcula_viaje` | POST | Después de crear gasto, `costo_viaje` se actualiza |

---

## Ejecución

```bash
cd api
php artisan test --filter=ViajeApiTest
php artisan test --filter=LiquidacionApiTest
php artisan test --filter=DocumentoApiTest
php artisan test --filter=GastoApiTest
```
