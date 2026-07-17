<?php

namespace Tests\Unit;

use App\Models\Viaje;
use App\Models\Liquidacion;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstadoTransitionsTest extends TestCase
{
    use RefreshDatabase;

    private $cliente;
    private $proveedor;
    private $chofer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cliente = Cliente::create([
            'razon_social' => 'Test Cliente',
            'cuit' => '30-11111111-1',
        ]);

        $this->proveedor = Proveedor::create([
            'razon_social' => 'Test Proveedor',
            'cuit' => '30-22222222-2',
        ]);

        $this->chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.111.111',
        ]);
    }

    private function crearViaje(array $overrides = []): Viaje
    {
        return Viaje::create(array_merge([
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 500000,
            'estado' => 'pendiente',
        ], $overrides));
    }

    private function crearLiquidacion(array $overrides = []): Liquidacion
    {
        return Liquidacion::create(array_merge([
            'numero' => 'LIQ-C-0001',
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
            'total' => 0,
            'estado' => 'borrador',
        ], $overrides));
    }

    // ================================================================
    // VIAJE ESTADOS
    // ================================================================

    public function test_viaje_estado_default_es_pendiente(): void
    {
        $viaje = $this->crearViaje();
        $this->assertEquals('pendiente', $viaje->estado->value);
    }

    public function test_viaje_cambiar_a_en_curso(): void
    {
        $viaje = $this->crearViaje(['estado' => 'pendiente']);
        $viaje->update(['estado' => 'en_curso']);
        $this->assertEquals('en_curso', $viaje->fresh()->estado->value);
    }

    public function test_viaje_cambiar_a_finalizado(): void
    {
        $viaje = $this->crearViaje(['estado' => 'en_curso']);
        $viaje->update(['estado' => 'finalizado']);
        $this->assertEquals('finalizado', $viaje->fresh()->estado->value);
    }

    public function test_viaje_cambiar_a_cancelado(): void
    {
        $viaje = $this->crearViaje(['estado' => 'pendiente']);
        $viaje->update(['estado' => 'cancelado']);
        $this->assertEquals('cancelado', $viaje->fresh()->estado->value);
    }

    public function test_viaje_cualquier_estado_a_cualquier_estado(): void
    {
        // finalizado -> pendiente (no hay restricciones)
        $viaje = $this->crearViaje(['estado' => 'finalizado']);
        $viaje->update(['estado' => 'pendiente']);
        $this->assertEquals('pendiente', $viaje->fresh()->estado->value);

        // cancelado -> en_curso
        $viaje2 = $this->crearViaje(['estado' => 'cancelado']);
        $viaje2->update(['estado' => 'en_curso']);
        $this->assertEquals('en_curso', $viaje2->fresh()->estado->value);
    }

    // ================================================================
    // LIQUIDACION ESTADOS
    // ================================================================

    public function test_liquidacion_estado_default_es_borrador(): void
    {
        $liq = $this->crearLiquidacion();
        $this->assertEquals('borrador', $liq->estado);
    }

    public function test_liquidacion_cambiar_estado(): void
    {
        $liq = $this->crearLiquidacion(['estado' => 'borrador']);
        $liq->update(['estado' => 'pendiente']);
        $this->assertEquals('pendiente', $liq->fresh()->estado);

        $liq->update(['estado' => 'facturada']);
        $this->assertEquals('facturada', $liq->fresh()->estado);
    }

    public function test_liquidacion_cualquier_estado_a_cualquier_estado(): void
    {
        // facturada -> borrador (sin restricciones)
        $liq = $this->crearLiquidacion(['estado' => 'facturada', 'numero' => 'LIQ-C-0100']);
        $liq->update(['estado' => 'borrador']);
        $this->assertEquals('borrador', $liq->fresh()->estado);

        // pendiente -> facturada
        $liq2 = $this->crearLiquidacion(['estado' => 'pendiente', 'numero' => 'LIQ-C-0101']);
        $liq2->update(['estado' => 'facturada']);
        $this->assertEquals('facturada', $liq2->fresh()->estado);
    }
}
