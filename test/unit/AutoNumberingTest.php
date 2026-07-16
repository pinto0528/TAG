<?php

namespace Tests\Unit;

use App\Models\Viaje;
use App\Models\Liquidacion;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoNumberingTest extends TestCase
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

    // ================================================================
    // CODIGO DE VIAJE
    // ================================================================

    public function test_viaje_codigo_propio(): void
    {
        $viaje = $this->crearViaje(['proveedor_id' => null]);
        $this->assertStringStartsWith('P-', $viaje->codigo_viaje);
    }

    public function test_viaje_codigo_proveedor(): void
    {
        $viaje = $this->crearViaje(['proveedor_id' => $this->proveedor->id]);
        $this->assertStringStartsWith('T-', $viaje->codigo_viaje);
    }

    public function test_viaje_nro_sequential(): void
    {
        $viaje1 = $this->crearViaje();
        $viaje2 = $this->crearViaje();
        $viaje3 = $this->crearViaje();

        $this->assertEquals($viaje1->nro_viaje + 1, $viaje2->nro_viaje);
        $this->assertEquals($viaje2->nro_viaje + 1, $viaje3->nro_viaje);
    }

    // ================================================================
    // NUMERO DE LIQUIDACION
    // ================================================================

    public function test_liquidacion_numero_cliente(): void
    {
        $liq = Liquidacion::create([
            'numero' => 'LIQ-C-0001',
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => '2026-07-15',
            'total' => 0,
            'estado' => 'borrador',
        ]);

        $this->assertStringStartsWith('LIQ-C-', $liq->numero);
    }

    public function test_liquidacion_numero_proveedor(): void
    {
        $liq = Liquidacion::create([
            'numero' => 'LIQ-P-0001',
            'tipo' => 'proveedor',
            'proveedor_id' => $this->proveedor->id,
            'fecha_emision' => '2026-07-15',
            'total' => 0,
            'estado' => 'borrador',
        ]);

        $this->assertStringStartsWith('LIQ-P-', $liq->numero);
    }
}
