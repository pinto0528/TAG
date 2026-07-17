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

class LiquidacionApiTest extends TestCase
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

    private static int $liqCounter = 0;

    private function crearLiquidacion(array $overrides = []): Liquidacion
    {
        self::$liqCounter++;
        $defaults = [
            'numero' => 'LIQ-TEST-' . str_pad(self::$liqCounter, 4, '0', STR_PAD_LEFT),
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'fecha_emision' => '2026-07-15',
            'total' => 0,
            'estado' => 'borrador',
        ];

        return Liquidacion::create(array_merge($defaults, $overrides));
    }

    // ================================================================
    // VIAJES DISPONIBLES — CLIENTE
    // ================================================================

    public function test_viajes_disponibles_tipo_cliente(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $viaje->id]);
    }

    public function test_viajes_disponibles_excluye_cancelados(): void
    {
        $this->crearViaje(['estado' => 'cancelado']);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonCount(0);
    }

    // ================================================================
    // VIAJES DISPONIBLES — PROVEEDOR
    // ================================================================

    public function test_viajes_disponibles_tipo_proveedor(): void
    {
        $viaje = $this->crearViaje([
            'proveedor_id' => $this->proveedor->id,
            'cliente_id' => null,
        ]);
        $liquidacion = $this->crearLiquidacion([
            'tipo' => 'proveedor',
            'cliente_id' => null,
            'proveedor_id' => $this->proveedor->id,
        ]);

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $viaje->id]);
    }

    // ================================================================
    // VIAJES DISPONIBLES — EXCLUYE MISMO TIPO
    // ================================================================

    public function test_viajes_disponibles_excluye_mismo_tipo(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liq1 = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);
        $liq1->viajes()->attach($viaje->id, ['monto' => 780000]);

        $liq2 = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);

        $response = $this->getJson("/api/liquidaciones/{$liq2->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonCount(0);
    }

    public function test_viajes_disponibles_permite_otro_tipo(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liqCliente = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);
        $liqCliente->viajes()->attach($viaje->id, ['monto' => 780000]);

        // Crear liquidacion de proveedor con el mismo viaje — debe permitirlo
        // (necesitamos un viaje con proveedor para esto, creamos uno nuevo)
        $viajeProv = $this->crearViaje([
            'proveedor_id' => $this->proveedor->id,
            'cliente_id' => null,
            'origen' => 'Cordoba',
        ]);
        $liqProveedor = $this->crearLiquidacion([
            'tipo' => 'proveedor',
            'cliente_id' => null,
            'proveedor_id' => $this->proveedor->id,
        ]);

        // El viaje de cliente NO deberia aparecer en liquidacion de proveedor
        // porque no tiene proveedor_id
        $response = $this->getJson("/api/liquidaciones/{$liqProveedor->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $viajeProv->id]);
    }

    // ================================================================
    // AGREGAR VIAJES
    // ================================================================

    public function test_agregar_viajes_a_liquidacion(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);

        $response = $this->postJson("/api/liquidaciones/{$liquidacion->id}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 780000],
            ],
        ]);

        $response->assertOk()
            ->assertJsonCount(1, 'viajes');

        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
            'monto' => 780000,
        ]);
    }

    public function test_agregar_viajes_recalcula_total(): void
    {
        $viaje1 = $this->crearViaje(['cliente_id' => $this->cliente->id, 'precio_pactado' => 500000]);
        $viaje2 = $this->crearViaje(['cliente_id' => $this->cliente->id, 'precio_pactado' => 300000, 'origen' => 'Cordoba']);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);

        $this->postJson("/api/liquidaciones/{$liquidacion->id}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje1->id],
                ['viaje_id' => $viaje2->id],
            ],
        ]);

        $liquidacion->refresh();
        $this->assertEquals(800000, $liquidacion->total);
    }

    public function test_agregar_viajes_estado_no_borrador(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id, 'estado' => 'pendiente']);

        $response = $this->postJson("/api/liquidaciones/{$liquidacion->id}/viajes", [
            'viajes' => [
                ['viaje_id' => $viaje->id],
            ],
        ]);

        $response->assertStatus(422);
    }

    // ================================================================
    // QUITAR VIAJE
    // ================================================================

    public function test_quitar_viaje_de_liquidacion(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);
        $liquidacion->viajes()->attach($viaje->id, ['monto' => 780000]);

        $response = $this->deleteJson("/api/liquidaciones/{$liquidacion->id}/viajes/{$viaje->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
        ]);
    }

    // ================================================================
    // ACTUALIZAR MONTO PIVOT
    // ================================================================

    public function test_actualizar_monto_pivot(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);
        $liquidacion = $this->crearLiquidacion(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id]);
        $liquidacion->viajes()->attach($viaje->id, ['monto' => 780000]);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/viajes/{$viaje->id}/monto", [
            'monto' => 850000,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
            'monto' => 850000,
        ]);

        $liquidacion->refresh();
        $this->assertEquals(850000, $liquidacion->total);
    }

    // ================================================================
    // CAMBIAR ESTADO LIQUIDACION
    // ================================================================

    public function test_cambiar_estado_liquidacion(): void
    {
        $liquidacion = $this->crearLiquidacion(['estado' => 'borrador']);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/estado", [
            'estado' => 'pendiente',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['estado' => 'pendiente']);

        $this->assertDatabaseHas('liquidaciones', [
            'id' => $liquidacion->id,
            'estado' => 'pendiente',
        ]);
    }

    public function test_cambiar_estado_invalido(): void
    {
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/estado", [
            'estado' => 'estado_inexistente',
        ]);

        $response->assertStatus(422);
    }

    // ================================================================
    // CRUD BASICO
    // ================================================================

    public function test_store_crea_liquidacion_cliente(): void
    {
        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['tipo' => 'cliente']);
    }

    public function test_store_crea_liquidacion_proveedor(): void
    {
        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-15',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['tipo' => 'proveedor']);
    }

    public function test_store_cliente_requiere_cliente_id(): void
    {
        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'fecha_emision' => '2026-07-15',
        ]);

        $response->assertStatus(422);
    }

    public function test_store_proveedor_requiere_proveedor_id(): void
    {
        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'proveedor',
            'fecha_emision' => '2026-07-15',
        ]);

        $response->assertStatus(422);
    }

    public function test_store_con_viajes(): void
    {
        $viaje = $this->crearViaje(['cliente_id' => $this->cliente->id]);

        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
            'viaje_ids' => [$viaje->id],
        ]);

        $response->assertCreated();

        $liquidacion = Liquidacion::latest()->first();
        $this->assertCount(1, $liquidacion->viajes);
    }

    public function test_show_retorna_liquidacion(): void
    {
        $liquidacion = $this->crearLiquidacion();

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $liquidacion->id]);
    }

    public function test_show_no_existe(): void
    {
        $response = $this->getJson('/api/liquidaciones/99999');

        $response->assertStatus(404);
    }

    public function test_destroy_soft_delete(): void
    {
        $liquidacion = $this->crearLiquidacion();

        $response = $this->deleteJson("/api/liquidaciones/{$liquidacion->id}");

        $response->assertOk();
        $this->assertSoftDeleted('liquidaciones', ['id' => $liquidacion->id]);
    }

    public function test_restore_recupera_liquidacion(): void
    {
        $liquidacion = $this->crearLiquidacion();
        $liquidacion->delete();

        $response = $this->postJson("/api/liquidaciones/{$liquidacion->id}/restore");

        $response->assertOk();
        $this->assertDatabaseHas('liquidaciones', ['id' => $liquidacion->id, 'deleted_at' => null]);
    }
}
