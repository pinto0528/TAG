<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->string('tipo')->default('A'); // A, B, C
            $table->string('punto_venta')->nullable();
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento')->nullable();
            $table->decimal('monto_neto', 12, 2)->default(0);
            $table->decimal('iva', 12, 2)->default(0);
            $table->decimal('monto_total', 12, 2)->default(0);
            $table->string('estado')->default('pendiente'); // pendiente, pagada, anulada
            $table->text('notas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
