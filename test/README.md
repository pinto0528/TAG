# Plan de Testing — TAG Logistica

## Infraestructura

- **Backend**: PHPUnit con SQLite in-memory (`api/phpunit.xml`)
- **Frontend**: Sin framework de tests instalado (testing manual)
- **Seeders**: Solo datos maestros (clientes, proveedores, choferes, unidades)
- **Cobertura actual**: 0% (solo placeholders de Laravel scaffold)

## Archivos

| Archivo | Contenido |
|---|---|
| `01-unit-tests.md` | Tests unitarios de fórmulas de costos y estados |
| `02-feature-tests.md` | Tests de endpoints API (CRUD + especiales) |
| `03-integration-tests.md` | Flujos completos de negocio |
| `04-manual-ui.md` | Checklist de testing manual de la UI |
| `05-ejecucion.md` | Comandos y orden de ejecución |

## Orden de Ejecución

1. Unit tests (fórmulas) — mayor riesgo
2. Integration tests (flujos completos)
3. Feature tests (endpoints)
4. Testing manual UI
