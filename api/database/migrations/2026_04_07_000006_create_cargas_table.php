<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viaje_id')->constrained('viajes')->cascadeOnDelete();
            $table->string('descripcion')->nullable();
            $table->string('tipo_carga')->nullable();
            $table->decimal('peso_kg', 10, 2)->nullable();
            $table->decimal('volumen_m3', 10, 2)->nullable();
            $table->integer('cantidad_bultos')->nullable();
            $table->decimal('temperatura_requerida', 5, 2)->nullable();
            $table->boolean('requiere_refrigeracion')->default(false);
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargas');
    }
};
