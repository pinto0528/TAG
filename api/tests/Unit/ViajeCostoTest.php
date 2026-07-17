<?php

namespace Tests\Unit;

use App\Models\Viaje;
use App\Models\Gasto;
use App\Models\Anticipo;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ViajeCostoTest extends TestCase
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
            'proveedor_id' => null,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 230000,
            'estado' => 'pendiente',
        ], $overrides));
    }

    private function crearGasto(Viaje $viaje, array $overrides = []): Gasto
    {
        return Gasto::create(array_merge([
            'viaje_id' => $viaje->id,
            'tipo' => 'gasto',
            'clase' => 'propio',
            'reintegro' => false,
            'concepto' => 'Test gasto',
            'monto' => 10000,
            'fecha' => '2026-07-15',
        ], $overrides));
    }

    private function crearAnticipo(Viaje $viaje, array $overrides = []): Anticipo
    {
        return Anticipo::create(array_merge([
            'viaje_id' => $viaje->id,
            'concepto' => 'Test anticipo',
            'monto' => 50000,
            'fecha' => '2026-07-15',
            'metodo_pago' => 'efectivo',
        ], $overrides));
    }

    // ================================================================
    // COSTO_PROVEEDOR_AJUSTADO
    // ================================================================

    public function test_costo_proveedor_ajustado_formula_basica(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 230000]);
        $this->crearAnticipo($viaje, ['monto' => 100000]);
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => true, 'monto' => 30000]);

        // costoProv(230000) - anticipos(100000) + terceroReint(30000) = 160000
        $this->assertEquals(160000, $viaje->costo_proveedor_ajustado);
    }

    public function test_costo_proveedor_ajustado_con_cero_anticipos(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 200000]);
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => true, 'monto' => 25000]);

        // costoProv(200000) - 0 + terceroReint(25000) = 225000
        $this->assertEquals(225000, $viaje->costo_proveedor_ajustado);
    }

    public function test_costo_proveedor_ajustado_con_cero_gastos(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 150000]);
        $this->crearAnticipo($viaje, ['monto' => 50000]);

        // costoProv(150000) - anticipos(50000) + 0 = 100000
        $this->assertEquals(100000, $viaje->costo_proveedor_ajustado);
    }

    public function test_costo_proveedor_ajustado_propio_reintegro_no_afecta(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 200000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => true, 'monto' => 40000]);

        // costoProv(200000) - 0 + 0 = 200000 (propioReintegro no entra)
        $this->assertEquals(200000, $viaje->costo_proveedor_ajustado);
    }

    // ================================================================
    // COSTO_VIAJE
    // ================================================================

    public function test_costo_viaje_formula_basica(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 230000]);
        $this->crearAnticipo($viaje, ['monto' => 100000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 10000]);
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => true, 'monto' => 30000]);
        $viaje->recalcularCostoViaje();

        // costoProv(230000) - anticipos(100000) + propioSinReint(10000) + terceroReint(30000) = 170000
        $this->assertEquals(170000, $viaje->fresh()->costo_viaje);
    }

    public function test_costo_viaje_con_cero_anticipos(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 200000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 20000]);
        $viaje->recalcularCostoViaje();

        // costoProv(200000) - 0 + propioSinReint(20000) + 0 = 220000
        $this->assertEquals(220000, $viaje->fresh()->costo_viaje);
    }

    public function test_costo_viaje_con_cero_gastos(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 180000]);
        $this->crearAnticipo($viaje, ['monto' => 60000]);
        $viaje->recalcularCostoViaje();

        // costoProv(180000) - anticipos(60000) + 0 + 0 = 120000
        $this->assertEquals(120000, $viaje->fresh()->costo_viaje);
    }

    public function test_costo_viaje_gastos_mixed(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 300000]);
        $this->crearAnticipo($viaje, ['monto' => 100000]);

        // Gastos que SÍ afectan:
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 15000]);    // +15000
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => true, 'monto' => 40000]);  // +40000

        // Gastos que NO afectan:
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => true, 'monto' => 20000]);     // ignora
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => false, 'monto' => 25000]); // ignora
        $viaje->recalcularCostoViaje();

        // costoProv(300000) - anticipos(100000) + propioSinReint(15000) + terceroReint(40000) = 255000
        $this->assertEquals(255000, $viaje->fresh()->costo_viaje);
    }

    public function test_costo_viaje_propio_s_reintegro_afecta(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 100000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 30000]);
        $viaje->recalcularCostoViaje();

        // costoProv(100000) - 0 + propioSinReint(30000) + 0 = 130000
        $this->assertEquals(130000, $viaje->fresh()->costo_viaje);
    }

    public function test_costo_viaje_proveedor_s_reintegro_no_afecta(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 100000]);
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => false, 'monto' => 30000]);
        $viaje->recalcularCostoViaje();

        // costoProv(100000) - 0 + 0 + 0 = 100000 (proveedor s/reint no entra)
        $this->assertEquals(100000, $viaje->fresh()->costo_viaje);
    }

    // ================================================================
    // RECALCULAR COSTO VIAJE
    // ================================================================

    public function test_recalcular_costo_viaje_persiste(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 200000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 25000]);

        $viaje->recalcularCostoViaje();

        // Verificar que se guardó en BD
        $viajeRefresh = Viaje::find($viaje->id);
        $this->assertEquals(225000, $viajeRefresh->costo_viaje);
    }

    // ================================================================
    // GANANCIA
    // ================================================================

    public function test_ganancia_formula(): void
    {
        $viaje = $this->crearViaje([
            'precio_pactado' => 780000,
            'costo_proveedor' => 230000,
        ]);
        $this->crearAnticipo($viaje, ['monto' => 100000]);
        $this->crearGasto($viaje, ['clase' => 'propio', 'reintegro' => false, 'monto' => 10000]);
        $this->crearGasto($viaje, ['clase' => 'proveedor', 'reintegro' => true, 'monto' => 30000]);
        $viaje->recalcularCostoViaje();

        // costoViaje = 230000 - 100000 + 10000 + 30000 = 170000
        // ganancia = 780000 - 170000 = 610000
        $ganancia = $viaje->fresh()->precio_pactado - $viaje->fresh()->costo_viaje;
        $this->assertEquals(610000, $ganancia);
    }
}
