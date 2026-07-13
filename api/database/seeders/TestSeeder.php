<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Chofer;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@tag.com',
            'password' => bcrypt('admin123'),
        ]);

        $clientes = [
            ['razon_social' => 'Transporte SRL', 'cuit' => '30-71111111-9', 'direccion' => 'San Martín 1234, CABA', 'telefono' => '011 4444-1111', 'email' => 'info@transportesrl.com', 'contacto' => 'Mario Pérez'],
            ['razon_social' => 'Distribuidora Norte', 'cuit' => '30-22222222-5', 'direccion' => 'Av. Industrial 567, Rosario', 'telefono' => '0341 555-2222', 'email' => 'logistica@distnorte.com', 'contacto' => 'Laura Gómez'],
        ];

        $proveedores = [
            ['razon_social' => 'Fletero López', 'cuit' => '27-33333333-1', 'direccion' => 'Belgrano 890, Córdoba', 'telefono' => '0351 666-3333', 'email' => 'fletero.lopez@gmail.com'],
            ['razon_social' => 'Transportes del Sur', 'cuit' => '33-44444444-9', 'direccion' => 'Ruta 8 km 45, La Plata', 'telefono' => '0221 777-4444', 'email' => 'contacto@tessur.com.ar'],
        ];

        $clientesModels = collect($clientes)->map(fn($c) => Cliente::create($c));
        $proveedoresModels = collect($proveedores)->map(fn($p) => Proveedor::create($p));

        $choferes = [
            ['nombre' => 'Juan', 'apellido' => 'García', 'dni' => '30.111.111', 'telefono' => '11 2222-3333', 'licencia_vencimiento' => '2027-05-15', 'proveedor_id' => null],
            ['nombre' => 'Carlos', 'apellido' => 'López', 'dni' => '28.222.222', 'telefono' => '11 3333-4444', 'licencia_vencimiento' => '2027-08-20', 'proveedor_id' => null],
            ['nombre' => 'Pedro', 'apellido' => 'Ramírez', 'dni' => '32.333.333', 'telefono' => '11 4444-5555', 'licencia_vencimiento' => '2027-03-10', 'proveedor_id' => $proveedoresModels[0]->id],
            ['nombre' => 'Luis', 'apellido' => 'Fernández', 'dni' => '31.444.444', 'telefono' => '11 5555-6666', 'licencia_vencimiento' => '2027-11-25', 'proveedor_id' => $proveedoresModels[1]->id],
        ];

        $unidades = [
            ['patente' => 'ABC 123', 'marca' => 'Mercedes-Benz', 'modelo' => 'Actros', 'tipo' => 'Chasis c/Acoplado', 'anio' => 2022, 'proveedor_id' => null],
            ['patente' => 'DEF 456', 'marca' => 'Scania', 'modelo' => 'R450', 'tipo' => 'Semi', 'anio' => 2023, 'proveedor_id' => null],
            ['patente' => 'GHI 789', 'marca' => 'Volvo', 'modelo' => 'FH16', 'tipo' => 'Chasis c/Acoplado', 'anio' => 2021, 'proveedor_id' => $proveedoresModels[0]->id],
            ['patente' => 'JKL 012', 'marca' => 'Iveco', 'modelo' => 'Stralis', 'tipo' => 'Semi', 'anio' => 2024, 'proveedor_id' => $proveedoresModels[1]->id],
        ];

        collect($choferes)->each(fn($c) => Chofer::create($c));
        collect($unidades)->each(fn($u) => Unidad::create($u));
    }
}
