<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@tag.com',
            'password' => bcrypt('admin123'),
        ]);

        // Mock Cliente (Formerly Proveedor)
        $cliente = \App\Models\Cliente::create([
            'razon_social' => 'Mercado Libre SRL',
            'cuit' => '30-71111111-9',
            'direccion' => 'Arias 3751, CABA',
            'telefono' => '011 4640-8000',
            'email' => 'logistica@mercadolibre.com',
            'contacto' => 'Andrés Galperín',
            'notas' => 'Cliente VIP',
        ]);

        // Mock Proveedor (Formerly Fletero)
        $proveedor_ext = \App\Models\Proveedor::create([
            'razon_social' => 'Transportes El Rápido S.A.',
            'cuit' => '33-44444444-9',
            'direccion' => 'Belgrano 1234, Rosario',
            'telefono' => '0341 456-1234',
            'email' => 'elrapido@gmail.com',
        ]);

        // Mock Chofer Propio
        $chofer_propio = \App\Models\Chofer::create([
            'nombre' => 'Roberto',
            'apellido' => 'Sánchez',
            'dni' => '21.456.789',
            'telefono' => '11 2345-6789',
            'licencia_vencimiento' => '2026-10-15',
            'linti_vencimiento' => '2025-08-20',
            'proveedor_id' => null, // Propio
        ]);

        // Mock Unidad Propia
        $unidad_propia = \App\Models\Unidad::create([
            'patente' => 'AE 456 XY',
            'marca' => 'Mercedes-Benz',
            'modelo' => 'Actros',
            'anio' => 2023,
            'tipo' => 'Chasis c/Acoplado',
            'numero_interno' => 'M-05',
            'vtv_vencimiento' => '2025-12-01',
            'seguro_vencimiento' => '2025-06-30',
            'activo' => true,
            'proveedor_id' => null, // Propio
        ]);

        // Mock Assets for Tercerizado
        $chofer_ext = \App\Models\Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'dni' => '30.111.222',
            'proveedor_id' => $proveedor_ext->id,
        ]);

        $unidad_ext = \App\Models\Unidad::create([
            'patente' => 'TER-789',
            'marca' => 'Scania',
            'modelo' => 'R450',
            'tipo' => 'Semi',
            'proveedor_id' => $proveedor_ext->id,
        ]);

        // 5 Fictitious Trips
        $trips = [
            ['origen' => 'Buenos Aires', 'destino' => 'Córdoba', 'tipo' => 'propio'],
            ['origen' => 'Rosario', 'destino' => 'Mendoza', 'tipo' => 'tercerizado'],
            ['origen' => 'CABA', 'destino' => 'Rosario', 'tipo' => 'propio'],
            ['origen' => 'Tucumán', 'destino' => 'Salta', 'tipo' => 'tercerizado'],
            ['origen' => 'Mardel Plata', 'destino' => 'Bahía Blanca', 'tipo' => 'propio'],
        ];

        foreach ($trips as $index => $tData) {
            $esTercerizado = $tData['tipo'] === 'tercerizado';
            
            $viaje = \App\Models\Viaje::create([
                'cliente_id' => $cliente->id,
                'proveedor_id' => $esTercerizado ? $proveedor_ext->id : null,
                'unidad_id' => $esTercerizado ? $unidad_ext->id : $unidad_propia->id,
                'chofer_id' => $esTercerizado ? $chofer_ext->id : $chofer_propio->id,
                'origen' => $tData['origen'],
                'destino' => $tData['destino'],
                'estado' => $index % 2 == 0 ? 'finalizado' : 'en_curso',
                'fecha_salida' => now()->addDays($index)->format('Y-m-d'),
                'hora_salida' => '08:00',
                'precio_pactado' => 150000 + ($index * 10000),
                'costo_proveedor' => $esTercerizado ? 120000 + ($index * 5000) : 0,
                'km_recorrido' => 300 + ($index * 50),
            ]);

            \App\Models\Carga::create([
                'viaje_id' => $viaje->id,
                'tipo_carga' => 'General',
                'peso_kg' => 20000,
                'requiere_refrigeracion' => $index % 3 == 0,
            ]);

            if ($index === 0) {
                \App\Models\Gasto::create([
                    'viaje_id' => $viaje->id,
                    'tipo' => 'Combustible',
                    'concepto' => 'Carga YPF',
                    'monto' => 45000,
                    'fecha' => now()->format('Y-m-d'),
                ]);
                \App\Models\Anticipo::create([
                    'viaje_id' => $viaje->id,
                    'concepto' => 'Adelanto Peajes',
                    'monto' => 5000,
                    'fecha' => now()->format('Y-m-d'),
                    'metodo_pago' => 'Efectivo',
                ]);
            }
        }
    }
}
