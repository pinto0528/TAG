<?php

namespace Tests\Feature;

use App\Models\Viaje;
use App\Models\Gasto;
use App\Models\Anticipo;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use App\Models\Unidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlujoViajeCompletoTest extends TestCase
{
    use RefreshDatabase;

    private $cliente;
    private $proveedor;
    private $chofer;
    private $unidad;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cliente = Cliente::create([
            'razon_social' => 'Cliente Test',
            'cuit' => '30-11111111-1',
        ]);

        $this->proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        $this->chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.111.111',
        ]);

        $this->unidad = Unidad::create([
            'marca' => 'Ford',
            'modelo' => 'F-100',
            'patente' => 'ABC-123',
            'anio' => 2024,
        ]);
    }

    // ================================================================
    // ESCENARIO 1: Viaje propio con gastos y anticipos
    // ================================================================

    public function test_viaje_propio_con_gastos_y_anticipos(): void
    {
        // 1. Crear viaje propio via API
        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 0,
            'unidades' => [$this->unidad->id],
        ]);

        $response->assertCreated();
        $viajeId = $response->json('id');

        // 2. Agregar gasto propio s/reintegro ($20,000)
        $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 20000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 3. Agregar gasto propio c/reintegro ($15,000) — NO afecta costo
        $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => true,
            'concepto' => 'Comida con reintegro',
            'monto' => 15000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 4. Verificar costo_viaje = 0 - 0 + 20,000 + 0 = $20,000
        $viaje = Viaje::find($viajeId);
        $this->assertEquals(20000, $viaje->costo_viaje);

        // 5. Verificar ganancia = 780,000 - 20,000 = $760,000
        $ganancia = $viaje->precio_pactado - $viaje->costo_viaje;
        $this->assertEquals(760000, $ganancia);
    }

    // ================================================================
    // ESCENARIO 2: Viaje con proveedor completo
    // ================================================================

    public function test_viaje_con_proveedor_completo(): void
    {
        // 1. Crear viaje con proveedor
        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => $this->proveedor->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 230000,
        ]);

        $response->assertCreated();
        $viajeId = $response->json('id');

        // 2. Agregar anticipo ($100,000)
        $this->postJson('/api/anticipos', [
            'viaje_id' => $viajeId,
            'monto' => 100000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 3. Agregar gasto proveedor c/reintegro ($30,000)
        $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'proveedor',
            'reintegro' => true,
            'concepto' => 'Flete proveedor',
            'monto' => 30000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 4. Agregar gasto proveedor s/reintegro ($25,000) — NO afecta costo
        $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'proveedor',
            'reintegro' => false,
            'concepto' => 'Gasto proveedor sin reintegro',
            'monto' => 25000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 5. Agregar gasto propio s/reintegro ($10,000)
        $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Propio sin reintegro',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        // 6. Verificar costo_proveedor_ajustado = 230,000 - 100,000 + 30,000 = $160,000
        $viaje = Viaje::find($viajeId);
        $this->assertEquals(160000, $viaje->costo_proveedor_ajustado);

        // 7. Verificar costo_viaje = 230,000 - 100,000 + 10,000 + 30,000 = $170,000
        $this->assertEquals(170000, $viaje->costo_viaje);

        // 8. Verificar ganancia = 780,000 - 170,000 = $610,000
        $ganancia = $viaje->precio_pactado - $viaje->costo_viaje;
        $this->assertEquals(610000, $ganancia);
    }

    // ================================================================
    // ESCENARIO 3: Crear, editar y eliminar gasto
    // ================================================================

    public function test_crear_editar_eliminar_gasto(): void
    {
        // 1. Crear viaje
        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'costo_proveedor' => 200000,
        ]);
        $viajeId = $response->json('id');

        $viaje = Viaje::find($viajeId);
        $costoOriginal = $viaje->costo_viaje;

        // 2. Crear gasto ($50,000)
        $gastoResponse = $this->postJson('/api/gastos', [
            'viaje_id' => $viajeId,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 50000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        $gastoId = $gastoResponse->json('id');

        // 3. Verificar que costo_viaje se actualizó
        $viaje->refresh();
        $this->assertEquals($costoOriginal + 50000, $viaje->costo_viaje);

        // 4. Editar gasto ($75,000)
        $this->putJson("/api/gastos/{$gastoId}", [
            'monto' => 75000,
        ])->assertOk();

        // 5. Verificar que costo_viaje se actualizó de nuevo
        $viaje->refresh();
        $this->assertEquals($costoOriginal + 75000, $viaje->costo_viaje);

        // 6. Eliminar gasto
        $this->deleteJson("/api/gastos/{$gastoId}")->assertOk();

        // 7. Verificar que costo_viaje volvió al valor original
        $viaje->refresh();
        $this->assertEquals($costoOriginal, $viaje->costo_viaje);
    }

    // ================================================================
    // ESCENARIO 4: Crear, editar y eliminar anticipo
    // ================================================================

    public function test_crear_editar_eliminar_anticipo(): void
    {
        // 1. Crear viaje con proveedor
        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => $this->proveedor->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'costo_proveedor' => 200000,
        ]);
        $viajeId = $response->json('id');

        $viaje = Viaje::find($viajeId);
        $costoProvOriginal = $viaje->costo_proveedor_ajustado;

        // 2. Crear anticipo ($50,000)
        $anticipoResponse = $this->postJson('/api/anticipos', [
            'viaje_id' => $viajeId,
            'monto' => 50000,
            'fecha' => '2026-07-15',
        ])->assertCreated();

        $anticipoId = $anticipoResponse->json('id');

        // 3. Verificar costo_proveedor_ajustado = 200,000 - 50,000 = $150,000
        $viaje->refresh();
        $this->assertEquals(150000, $viaje->costo_proveedor_ajustado);

        // 4. Editar anticipo ($80,000)
        $this->putJson("/api/anticipos/{$anticipoId}", [
            'monto' => 80000,
        ])->assertOk();

        // 5. Verificar costo_proveedor_ajustado = 200,000 - 80,000 = $120,000
        $viaje->refresh();
        $this->assertEquals(120000, $viaje->costo_proveedor_ajustado);

        // 6. Eliminar anticipo
        $this->deleteJson("/api/anticipos/{$anticipoId}")->assertOk();

        // 7. Verificar costo_proveedor_ajustado = $200,000
        $viaje->refresh();
        $this->assertEquals($costoProvOriginal, $viaje->costo_proveedor_ajustado);
    }
}
