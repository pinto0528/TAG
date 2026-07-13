<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viaje_id')->constrained('viajes')->cascadeOnDelete()->unique();
            $table->string('tipo'); // REMITO, CARTA_DE_PORTE, HOJA_DE_RUTA
            $table->string('numero');
            $table->date('fecha');
            $table->string('descripcion')->nullable();
            $table->string('estado')->default('pendiente'); // pendiente, conforme, rechazado
            $table->text('notas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
