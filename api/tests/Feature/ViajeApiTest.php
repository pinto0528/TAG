<?php

namespace Tests\Feature;

use App\Models\Viaje;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use App\Models\Unidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ViajeApiTest extends TestCase
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
            'costo_proveedor' => 0,
            'estado' => 'pendiente',
        ], $overrides));
    }

    // ================================================================
    // CAMBIAR ESTADO
    // ================================================================

    public function test_cambiar_estado_viaje(): void
    {
        $viaje = $this->crearViaje(['estado' => 'pendiente']);

        $response = $this->patchJson("/api/viajes/{$viaje->id}/estado", [
            'estado' => 'en_curso',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['estado' => 'en_curso']);

        $this->assertDatabaseHas('viajes', [
            'id' => $viaje->id,
            'estado' => 'en_curso',
        ]);
    }

    public function test_cambiar_estado_invalido(): void
    {
        $viaje = $this->crearViaje(['estado' => 'pendiente']);

        $response = $this->patchJson("/api/viajes/{$viaje->id}/estado", [
            'estado' => 'estado_inexistente',
        ]);

        $response->assertStatus(422);
    }

    // ================================================================
    // CRUD BASICO
    // ================================================================

    public function test_index_lista_viajes(): void
    {
        $this->crearViaje();
        $this->crearViaje(['origen' => 'Cordoba']);

        $response = $this->getJson('/api/viajes');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_store_crea_viaje(): void
    {
        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-20',
            'precio_pactado' => 500000,
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['origen' => 'CABA']);

        $this->assertDatabaseHas('viajes', ['origen' => 'CABA']);
    }

    public function test_store_validacion_campos_requeridos(): void
    {
        $response = $this->postJson('/api/viajes', []);

        $response->assertStatus(422);
    }

    public function test_show_retorna_viaje(): void
    {
        $viaje = $this->crearViaje();

        $response = $this->getJson("/api/viajes/{$viaje->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $viaje->id]);
    }

    public function test_show_no_existe(): void
    {
        $response = $this->getJson('/api/viajes/99999');

        $response->assertStatus(404);
    }

    public function test_update_modifica_viaje(): void
    {
        $viaje = $this->crearViaje();

        $response = $this->putJson("/api/viajes/{$viaje->id}", [
            'origen' => 'Buenos Aires',
            'destino' => 'Mendoza',
            'fecha_salida' => '2026-07-20',
            'precio_pactado' => 900000,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['origen' => 'Buenos Aires']);
    }

    public function test_destroy_soft_delete(): void
    {
        $viaje = $this->crearViaje();

        $response = $this->deleteJson("/api/viajes/{$viaje->id}");

        $response->assertOk();
        $this->assertSoftDeleted('viajes', ['id' => $viaje->id]);
    }

    public function test_index_no_muestra_eliminados(): void
    {
        $this->crearViaje();
        $viaje2 = $this->crearViaje(['origen' => 'Cordoba']);
        $viaje2->delete();

        $response = $this->getJson('/api/viajes');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_restore_recupera_viaje(): void
    {
        $viaje = $this->crearViaje();
        $viaje->delete();

        $response = $this->postJson("/api/viajes/{$viaje->id}/restore");

        $response->assertOk();
        $this->assertDatabaseHas('viajes', ['id' => $viaje->id, 'deleted_at' => null]);
    }

    // ================================================================
    // MULTI-UNIDAD
    // ================================================================

    public function test_store_con_unidades(): void
    {
        $unidad2 = Unidad::create([
            'marca' => 'Mercedes',
            'modelo' => 'Actros',
            'patente' => 'DEF-456',
            'anio' => 2023,
        ]);

        $response = $this->postJson('/api/viajes', [
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-20',
            'unidades' => [$this->unidad->id, $unidad2->id],
        ]);

        $response->assertCreated();

        $viaje = Viaje::where('origen', 'CABA')->first();
        $this->assertCount(2, $viaje->unidades);
    }
}
