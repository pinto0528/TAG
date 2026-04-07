<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_pago_id')->constrained('ordenes_pago')->cascadeOnDelete();
            $table->string('numero');
            $table->string('banco');
            $table->date('fecha_emision');
            $table->date('fecha_cobro')->nullable();
            $table->decimal('monto', 12, 2);
            $table->string('beneficiario')->nullable();
            $table->string('estado')->default('pendiente'); // pendiente, cobrado, rechazado, anulado
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};
