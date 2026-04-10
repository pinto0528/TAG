<?php

namespace Database\Seeders;

use App\Models\Chofer;
use App\Models\Fletero;
use App\Models\Proveedor;
use App\Models\Unidad;
use App\Models\Viaje;
use App\Models\User;
use App\Enums\EstadoViaje;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class CapacitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        $user = User::first() ?? User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'test@tag.com',
        ]);

        $this->command->info('Setting up resources...');
        
        $proveedores = [];
        for ($i = 0; $i < 5; $i++) {
            $proveedores[] = Proveedor::firstOrCreate(
                ['cuit' => "30-9999000{$i}-9"],
                [
                    'razon_social' => $faker->company . ' (Seed)',
                    'direccion' => $faker->address,
                    'telefono' => $faker->phoneNumber,
                    'email' => $faker->companyEmail,
                    'contacto' => $faker->name,
                    'unidad_medida' => $faker->randomElement(['tonelada', 'kg', 'viaje', 'km']),
                    'tarifa' => $faker->randomFloat(2, 100, 5000),
                    'notas' => 'Seed data for capacity test',
                ]
            );
        }

        $unidades = [];
        for ($i = 0; $i < 5; $i++) {
            $unidades[] = Unidad::firstOrCreate(
                ['numero_interno' => "900{$i}"],
                [
                    'patente' => strtoupper($faker->bothify('?? ### ??')),
                    'marca' => $faker->randomElement(['Scania', 'Volvo', 'Mercedes-Benz', 'Iveco', 'Ford']),
                    'modelo' => $faker->word,
                    'anio' => $faker->year(),
                    'tipo' => $faker->randomElement(['Chasis', 'Acoplado', 'Semi', 'Tractor']),
                    'vtv_vencimiento' => $faker->dateTimeBetween('now', '+1 year'),
                    'seguro_vencimiento' => $faker->dateTimeBetween('now', '+1 year'),
                    'activo' => true,
                ]
            );
        }

        $choferes = [];
        for ($i = 0; $i < 5; $i++) {
            $choferes[] = Chofer::firstOrCreate(
                ['dni' => "99.000.00{$i}"],
                [
                    'nombre' => $faker->firstName,
                    'apellido' => $faker->lastName,
                    'telefono' => $faker->phoneNumber,
                    'email' => $faker->safeEmail,
                    'direccion' => $faker->address,
                    'fecha_nacimiento' => $faker->dateTimeBetween('-50 years', '-25 years'),
                    'licencia_vencimiento' => $faker->dateTimeBetween('now', '+2 years'),
                    'linti_vencimiento' => $faker->dateTimeBetween('now', '+1 year'),
                    'activo' => true,
                ]
            );
        }

        $fleteros = [];
        for ($i = 0; $i < 5; $i++) {
            $fleteros[] = Fletero::firstOrCreate(
                ['cuit' => "20-9999000{$i}-9"],
                [
                    'razon_social' => $faker->company . ' Fletes Seed',
                    'telefono' => $faker->phoneNumber,
                    'email' => $faker->companyEmail,
                    'contacto' => $faker->name,
                    'notas' => 'Seed fletero for capacity test',
                ]
            );
        }

        $currentTrips = Viaje::count();
        $neededTrips = 50 - $currentTrips;
        
        if ($neededTrips <= 0) {
            $this->command->info("Already have {$currentTrips} trips. Adding 10 more for good measure.");
            $neededTrips = 10;
        }

        $this->command->info("Generating {$neededTrips} Random Trips...");
        for ($i = 0; $i < $neededTrips; $i++) {
            $isFletero = $faker->boolean(30);
            $fletero = $isFletero ? $faker->randomElement($fleteros) : null;
            $unidad = $faker->boolean(80) ? $faker->randomElement($unidades) : null;
            $chofer = $faker->boolean(80) ? $faker->randomElement($choferes) : null;
            $proveedor = $faker->randomElement($proveedores);

            $fechaSalida = $faker->dateTimeBetween('-1 month', 'now');
            $fechaLlegada = (clone $fechaSalida)->modify('+' . rand(1, 48) . ' hours');

            Viaje::create([
                'unidad_id' => $unidad?->id,
                'chofer_id' => $chofer?->id,
                'proveedor_id' => $proveedor->id,
                'fletero_id' => $fletero?->id,
                'estado' => $faker->randomElement(EstadoViaje::cases()),
                'origen' => $faker->city,
                'destino' => $faker->city,
                'fecha_salida' => $fechaSalida->format('Y-m-d'),
                'hora_salida' => $fechaSalida->format('H:i:s'),
                'fecha_llegada' => $fechaLlegada->format('Y-m-d'),
                'hora_llegada' => $fechaLlegada->format('H:i:s'),
                'precio' => $faker->randomFloat(2, 50000, 500000),
                'km_recorrido' => $faker->numberBetween(50, 2000),
                'observaciones' => $faker->sentence(),
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
        }

        $this->command->info('Capacity seeding completed successfully!');
    }
}
