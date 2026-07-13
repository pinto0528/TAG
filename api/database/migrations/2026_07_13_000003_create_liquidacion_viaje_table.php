<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liquidacion_viaje', function (Blueprint $table) {
            $table->id();
            $table->foreignId('liquidacion_id')->constrained('liquidaciones')->cascadeOnDelete();
            $table->foreignId('viaje_id')->constrained('viajes')->cascadeOnDelete();
            $table->decimal('monto', 12, 2)->default(0);
            $table->timestamps();
            $table->unique(['liquidacion_id', 'viaje_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidacion_viaje');
    }
};
