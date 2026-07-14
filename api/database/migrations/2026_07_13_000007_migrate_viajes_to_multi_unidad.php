<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        // Drop and recreate viajes without unidad_id (data doesn't matter)
        Schema::dropIfExists('viajes');
        Schema::create('viajes', function (Blueprint $table) {
            $table->id();
            $table->integer('nro_viaje')->nullable();
            $table->foreignId('chofer_id')->nullable()->constrained('choferes')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->nullOnDelete();
            $table->string('estado')->default('pendiente');
            $table->string('origen')->nullable();
            $table->string('destino')->nullable();
            $table->date('fecha_salida');
            $table->time('hora_salida')->nullable();
            $table->date('fecha_llegada')->nullable();
            $table->time('hora_llegada')->nullable();
            $table->decimal('precio_pactado', 12, 2)->default(0);
            $table->decimal('costo_proveedor', 12, 2)->default(0);
            $table->integer('km_recorrido')->default(0);
            $table->text('observaciones')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->string('tipo_tarifa')->nullable();
            $table->decimal('tarifa_valor', 15, 2)->nullable();
            $table->decimal('tarifa_base', 15, 2)->nullable();
        });

        // Pivot table for many-to-many units
        Schema::create('viaje_unidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viaje_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('unidad_id');
            $table->foreign('unidad_id')->references('id')->on('unidades')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['viaje_id', 'unidad_id']);
        });

        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        Schema::dropIfExists('viaje_unidad');

        Schema::table('viajes', function (Blueprint $table) {
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
        });

        DB::statement('PRAGMA foreign_keys = ON');
    }
};
