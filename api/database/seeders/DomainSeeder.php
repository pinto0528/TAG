<?php

namespace Database\Seeders;

use App\Models\Viaje;
use App\Models\Unidad;
use App\Models\Chofer;
use App\Models\Proveedor;
use App\Models\Carga;
use App\Models\Remito;
use App\Models\Factura;
use App\Models\OrdenPago;
use App\Models\Cheque;
use App\Models\User;
use App\Enums\EstadoViaje;
use Illuminate\Database\Seeder;

class DomainSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        // 1. Create Resources
        $prov = Proveedor::create([
            'razon_social' => 'Acme Corp (Seeded)',
            'cuit' => '30-11111111-9',
            'unidad_medida' => 'por_kg',
            'tarifa' => 50,
        ]);

        $unidad = Unidad::create([
            'patente' => 'AF123JK',
            'marca' => 'Scania',
            'modelo' => 'R450',
            'tipo' => 'Chasis',
        ]);

        $chofer = Chofer::create([
            'nombre' => 'Carlos',
            'apellido' => 'Carrera',
            'dni' => '22.333.444',
            'telefono' => '11-2222-3333',
        ]);

        // 2. Create Viaje
        $viaje = Viaje::create([
            'unidad_id' => $unidad->id,
            'chofer_id' => $chofer->id,
            'proveedor_id' => $prov->id,
            'estado' => EstadoViaje::FINALIZADO,
            'origen' => 'Rosario',
            'destino' => 'Buenos Aires',
            'fecha_salida' => now()->subDays(5),
            'precio' => 1000000,
            'created_by' => $user->id,
        ]);

        Carga::create([
            'viaje_id' => $viaje->id,
            'descripcion' => 'Carga General Semillas',
            'tipo_carga' => 'Granel',
            'peso_kg' => 20000,
        ]);

        // 3. THE CHAIN: Remito * -> 1 Factura 1 -> 1 OP 1 -> * Cheques
        
        $factura = Factura::create([
            'numero' => 'FC-A-0001-00009999',
            'tipo' => 'A',
            'fecha_emision' => now()->subDays(3),
            'monto_total' => 1000000,
            'estado' => 'pagada',
            'created_by' => $user->id,
        ]);

        // Two remitos grouped in one factura
        Remito::create([
            'viaje_id' => $viaje->id,
            'factura_id' => $factura->id,
            'numero' => 'R-0001-00000123',
            'fecha' => now()->subDays(4),
            'descripcion' => 'Parte A de la carga',
            'estado' => 'conforme',
        ]);

        Remito::create([
            'viaje_id' => $viaje->id,
            'factura_id' => $factura->id,
            'numero' => 'R-0001-00000124',
            'fecha' => now()->subDays(4),
            'descripcion' => 'Parte B de la carga',
            'estado' => 'conforme',
        ]);

        // Factura -> Orden Pago
        $op = OrdenPago::create([
            'factura_id' => $factura->id,
            'numero' => 'OP-0001-5555',
            'fecha' => now()->subDays(2),
            'monto_total' => 1000000,
            'estado' => 'pagada',
            'created_by' => $user->id,
        ]);

        // OP -> Cheques
        Cheque::create([
            'orden_pago_id' => $op->id,
            'numero' => 'CH-00000001',
            'banco' => 'Banco Nación',
            'fecha_emision' => now()->subDays(2),
            'fecha_cobro' => now()->addDays(15),
            'monto' => 600000,
            'estado' => 'pendiente',
        ]);

        Cheque::create([
            'orden_pago_id' => $op->id,
            'numero' => 'CH-00000002',
            'banco' => 'Banco Nación',
            'fecha_emision' => now()->subDays(2),
            'fecha_cobro' => now()->addDays(30),
            'monto' => 400000,
            'estado' => 'pendiente',
        ]);
    }
}
