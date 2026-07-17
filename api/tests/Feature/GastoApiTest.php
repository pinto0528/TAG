<?php

namespace Tests\Feature;

use App\Models\Viaje;
use App\Models\Gasto;
use App\Models\Cliente;
use App\Models\Chofer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GastoApiTest extends TestCase
{
    use RefreshDatabase;

    private $cliente;
    private $chofer;
    private $viaje;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cliente = Cliente::create([
            'razon_social' => 'Cliente Test',
            'cuit' => '30-11111111-1',
        ]);

        $this->chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.111.111',
        ]);

        $this->viaje = Viaje::create([
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 230000,
            'estado' => 'pendiente',
        ]);
    }

    // ================================================================
    // VALIDACION CLASE
    // ================================================================

    public function test_gasto_clase_propio(): void
    {
        $response = $this->postJson('/api/gastos', [
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Test propio',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['clase' => 'propio']);
    }

    public function test_gasto_clase_proveedor(): void
    {
        $response = $this->postJson('/api/gastos', [
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'proveedor',
            'reintegro' => false,
            'concepto' => 'Test proveedor',
            'monto' => 15000,
            'fecha' => '2026-07-15',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['clase' => 'proveedor']);
    }

    public function test_gasto_clase_invalida(): void
    {
        $response = $this->postJson('/api/gastos', [
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'tercerizado',
            'reintegro' => false,
            'concepto' => 'Test invalido',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ]);

        $response->assertStatus(422);
    }

    // ================================================================
    // RECALCULO COSTO VIAJE
    // ================================================================

    public function test_gasto_recalcula_viaje(): void
    {
        $this->postJson('/api/gastos', [
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 25000,
            'fecha' => '2026-07-15',
        ]);

        $this->viaje->refresh();
        // costoProv(230000) - 0 + propioSinReint(25000) + 0 = 255000
        $this->assertEquals(255000, $this->viaje->costo_viaje);
    }

    public function test_gasto_update_recalcula_viaje(): void
    {
        $gasto = Gasto::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 25000,
            'fecha' => '2026-07-15',
        ]);

        $this->putJson("/api/gastos/{$gasto->id}", [
            'monto' => 50000,
        ]);

        $this->viaje->refresh();
        // costoProv(230000) - 0 + propioSinReint(50000) + 0 = 280000
        $this->assertEquals(280000, $this->viaje->costo_viaje);
    }

    public function test_gasto_destroy_recalcula_viaje(): void
    {
        $gasto = Gasto::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 25000,
            'fecha' => '2026-07-15',
        ]);

        $this->viaje->refresh();
        $this->assertEquals(255000, $this->viaje->costo_viaje);

        $this->deleteJson("/api/gastos/{$gasto->id}");

        $this->viaje->refresh();
        $this->assertEquals(0, $this->viaje->costo_viaje);
    }

    // ================================================================
    // CRUD BASICO
    // ================================================================

    public function test_index_lista_gastos(): void
    {
        Gasto::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/gastos');

        $response->assertOk()
            ->assertJsonCount(1);
    }

    public function test_show_retorna_gasto(): void
    {
        $gasto = Gasto::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ]);

        $response = $this->getJson("/api/gastos/{$gasto->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $gasto->id]);
    }

    public function test_destroy_soft_delete(): void
    {
        $gasto = Gasto::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Peaje',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ]);

        $response = $this->deleteJson("/api/gastos/{$gasto->id}");

        $response->assertOk();
        $this->assertSoftDeleted('gastos', ['id' => $gasto->id]);
    }
}
