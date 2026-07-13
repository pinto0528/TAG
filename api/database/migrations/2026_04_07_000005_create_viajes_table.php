<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viajes', function (Blueprint $table) {
            $table->id();
            $table->integer('nro_viaje')->nullable();
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->foreignId('chofer_id')->nullable()->constrained('choferes');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores');
            $table->string('estado')->default('pendiente');
            $table->string('origen')->nullable();
            $table->string('destino')->nullable();
            $table->date('fecha_salida')->default(date('Y-m-d'));
            $table->time('hora_salida')->nullable();
            $table->date('fecha_llegada')->nullable();
            $table->time('hora_llegada')->nullable();
            $table->decimal('precio_pactado', 12, 2)->default(0);
            $table->decimal('costo_proveedor', 12, 2)->default(0);
            $table->integer('km_recorrido')->default(0);
            $table->text('observaciones')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viajes');
    }
};
