<?php

namespace Tests\Feature;

use App\Models\Viaje;
use App\Models\Liquidacion;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use App\Models\Unidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlujoLiquidacionCompletoTest extends TestCase
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

    private function crearViaje(array $overrides = []): Viaje
    {
        return Viaje::create(array_merge([
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 230000,
            'estado' => 'finalizado',
        ], $overrides));
    }

    // ================================================================
    // ESCENARIO 1: Liquidación de proveedor
    // ================================================================

    public function test_liquidacion_proveedor(): void
    {
        // 1. Crear viajes con proveedor
        $viaje1 = $this->crearViaje([
            'proveedor_id' => $this->proveedor->id,
            'cliente_id' => null,
            'costo_proveedor' => 200000,
            'origen' => 'CABA',
        ]);

        $viaje2 = $this->crearViaje([
            'proveedor_id' => $this->proveedor->id,
            'cliente_id' => null,
            'costo_proveedor' => 150000,
            'origen' => 'Cordoba',
        ]);

        // 2. Crear liquidacion tipo=proveedor
        $liqResponse = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-15',
        ])->assertCreated();

        $liqId = $liqResponse->json('id');

        // 3. GET viajes-disponibles → debe mostrar viaje 1 y 2
        $disponibles = $this->getJson("/api/liquidaciones/{$liqId}/viajes-disponibles")
            ->assertOk()
            ->json();

        $this->assertCount(2, $disponibles);

        // 4. POST agregar viajes
        $this->postJson("/api/liquidaciones/{$liqId}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje1->id],
                ['viaje_id' => $viaje2->id],
            ],
        ])->assertOk();

        // 5. Verificar que liquidacion.viajes.length == 2
        $liqResponse = $this->getJson("/api/liquidaciones/{$liqId}")->assertOk();
        $this->assertCount(2, $liqResponse->json('viajes'));

        // 6. Verificar montos del pivot
        $viajesLiq = $liqResponse->json('viajes');
        $montos = array_map(fn($v) => $v['pivot']['monto'], $viajesLiq);
        sort($montos);
        // Los montos son costo_proveedor_ajustado de cada viaje
        // Viaje1: 200000 - 0 + 0 = 200000 (sin anticipos ni gastos con reintegro)
        // Viaje2: 150000 - 0 + 0 = 150000
        $this->assertEquals([150000, 200000], $montos);

        // 7. Verificar que viaje 1 ya NO aparece en viajes-disponibles de otra liquidación proveedor
        $liq2Response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-16',
        ])->assertCreated();

        $liq2Id = $liq2Response->json('id');

        $disponibles2 = $this->getJson("/api/liquidaciones/{$liq2Id}/viajes-disponibles")
            ->assertOk()
            ->json();

        $disponiblesIds = array_map(fn($v) => $v['id'], $disponibles2);
        $this->assertNotContains($viaje1->id, $disponiblesIds);
        $this->assertNotContains($viaje2->id, $disponiblesIds);

        // 8. Verificar que viaje 1 SÍ aparece en viajes-disponibles de liquidación cliente
        $liqClienteResponse = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-16',
        ])->assertCreated();

        $liqClienteId = $liqClienteResponse->json('id');

        // Para que viaje1 aparezca en liquidación cliente, necesitamos que tenga cliente_id
        // Re-creamos viaje1 con cliente_id
        $viaje1ConCliente = $this->crearViaje([
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'costo_proveedor' => 200000,
            'origen' => 'Mendoza',
        ]);

        // Agregar viaje1 a liquidación proveedor original
        $this->postJson("/api/liquidaciones/{$liqId}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje1ConCliente->id],
            ],
        ])->assertOk();

        // Verificar que viaje1ConCliente NO aparece en viajes-disponibles de otra liq proveedor
        $disponibles3 = $this->getJson("/api/liquidaciones/{$liq2Id}/viajes-disponibles")
            ->assertOk()
            ->json();

        $disponibles3Ids = array_map(fn($v) => $v['id'], $disponibles3);
        $this->assertNotContains($viaje1ConCliente->id, $disponibles3Ids);

        // Verificar que viaje1ConCliente SÍ aparece en viajes-disponibles de liq cliente
        $disponiblesCliente = $this->getJson("/api/liquidaciones/{$liqClienteId}/viajes-disponibles")
            ->assertOk()
            ->json();

        $disponiblesClienteIds = array_map(fn($v) => $v['id'], $disponiblesCliente);
        $this->assertContains($viaje1ConCliente->id, $disponiblesClienteIds);
    }

    // ================================================================
    // ESCENARIO 2: Liquidación de cliente
    // ================================================================

    public function test_liquidacion_cliente(): void
    {
        // 1. Crear viaje propio
        $viaje = $this->crearViaje([
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'precio_pactado' => 780000,
        ]);

        // 2. Crear liquidacion tipo=cliente
        $liqResponse = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
        ])->assertCreated();

        $liqId = $liqResponse->json('id');

        // 3. GET viajes-disponibles → debe mostrar viaje propio
        $disponibles = $this->getJson("/api/liquidaciones/{$liqId}/viajes-disponibles")
            ->assertOk()
            ->json();

        $this->assertCount(1, $disponibles);
        $this->assertEquals($viaje->id, $disponibles[0]['id']);

        // 4. POST agregar viajes
        $this->postJson("/api/liquidaciones/{$liqId}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje->id],
            ],
        ])->assertOk();

        // 5. Verificar monto del pivot = precio_pactado ($780,000)
        $liqResponse = $this->getJson("/api/liquidaciones/{$liqId}")->assertOk();
        $viajesLiq = $liqResponse->json('viajes');

        $this->assertCount(1, $viajesLiq);
        $this->assertEquals(780000, $viajesLiq[0]['pivot']['monto']);
    }

    // ================================================================
    // ESCENARIO 3: Viaje compartido entre liquidaciones
    // ================================================================

    public function test_viaje_compartido_entre_liquidaciones(): void
    {
        // 1. Crear viaje con proveedor
        $viaje = $this->crearViaje([
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => $this->proveedor->id,
        ]);

        // 2. Crear liquidacion cliente → agregar viaje
        $liqCliente = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
        ])->json();

        $this->postJson("/api/liquidaciones/{$liqCliente['id']}/viajes", [
            'viajes' => [['viaje_id' => $viaje->id]],
        ])->assertOk();

        // 3. Crear liquidacion proveedor → agregar mismo viaje
        $liqProveedor = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-15',
        ])->json();

        $this->postJson("/api/liquidaciones/{$liqProveedor['id']}/viajes", [
            'viajes' => [['viaje_id' => $viaje->id]],
        ])->assertOk();

        // 4. Verificar que ambos muestran el viaje
        $liq1 = $this->getJson("/api/liquidaciones/{$liqCliente['id']}")->json();
        $liq2 = $this->getJson("/api/liquidaciones/{$liqProveedor['id']}")->json();

        $this->assertCount(1, $liq1['viajes']);
        $this->assertCount(1, $liq2['viajes']);
        $this->assertEquals($viaje->id, $liq1['viajes'][0]['id']);
        $this->assertEquals($viaje->id, $liq2['viajes'][0]['id']);

        // 5. Verificar que un TERCER viaje en liquidación proveedor NO puede agregar el mismo viaje
        $liq3Proveedor = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-16',
        ])->json();

        $disponibles3 = $this->getJson("/api/liquidaciones/{$liq3Proveedor['id']}/viajes-disponibles")
            ->assertOk()
            ->json();

        $disponibles3Ids = array_map(fn($v) => $v['id'], $disponibles3);
        $this->assertNotContains($viaje->id, $disponibles3Ids);
    }

    // ================================================================
    // ESCENARIO 4: Quitar y re-agregar viaje
    // ================================================================

    public function test_quitar_y_reagregar_viaje(): void
    {
        // 1. Crear liquidacion con 2 viajes
        $viaje1 = $this->crearViaje([
            'cliente_id' => $this->cliente->id,
            'precio_pactado' => 500000,
            'origen' => 'CABA',
        ]);

        $viaje2 = $this->crearViaje([
            'cliente_id' => $this->cliente->id,
            'precio_pactado' => 300000,
            'origen' => 'Cordoba',
        ]);

        $liqResponse = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
        ])->json();

        $liqId = $liqResponse['id'];

        $this->postJson("/api/liquidaciones/{$liqId}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje1->id],
                ['viaje_id' => $viaje2->id],
            ],
        ])->assertOk();

        // Verificar que tiene 2 viajes
        $liq = $this->getJson("/api/liquidaciones/{$liqId}")->json();
        $this->assertCount(2, $liq['viajes']);

        // 2. Quitar viaje 1
        $this->deleteJson("/api/liquidaciones/{$liqId}/viajes/{$viaje1->id}")
            ->assertOk();

        // 3. Verificar que liquidacion tiene 1 viaje
        $liq = $this->getJson("/api/liquidaciones/{$liqId}")->json();
        $this->assertCount(1, $liq['viajes']);

        // 4. Verificar que viaje 1 vuelve a aparecer en viajes-disponibles
        $disponibles = $this->getJson("/api/liquidaciones/{$liqId}/viajes-disponibles")
            ->assertOk()
            ->json();

        $disponiblesIds = array_map(fn($v) => $v['id'], $disponibles);
        $this->assertContains($viaje1->id, $disponiblesIds);

        // 5. Re-agregar viaje 1
        $this->postJson("/api/liquidaciones/{$liqId}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje1->id],
            ],
        ])->assertOk();

        // 6. Verificar que liquidacion tiene 2 viajes de nuevo
        $liq = $this->getJson("/api/liquidaciones/{$liqId}")->json();
        $this->assertCount(2, $liq['viajes']);
    }
}
