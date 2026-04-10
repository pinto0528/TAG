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
            $table->foreignId('unidad_id')->constrained('unidades');
            $table->foreignId('chofer_id')->nullable()->constrained('choferes');
            $table->foreignId('proveedor_id')->constrained('proveedores');
            $table->foreignId('fletero_id')->nullable()->constrained('fleteros');
            $table->string('estado')->default('pendiente');
            $table->string('origen');
            $table->string('destino');
            $table->date('fecha_salida')->nullable();
            $table->time('hora_salida')->nullable();
            $table->date('fecha_llegada')->nullable();
            $table->time('hora_llegada')->nullable();
            $table->decimal('precio', 12, 2)->default(0);
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
