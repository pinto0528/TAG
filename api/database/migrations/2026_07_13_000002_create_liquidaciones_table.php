<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liquidaciones', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique(); // LIQ-C-XXXX o LIQ-P-XXXX
            $table->string('tipo'); // cliente, proveedor
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores');
            $table->date('fecha_emision');
            $table->decimal('total', 12, 2)->default(0);
            $table->string('estado')->default('borrador'); // borrador, pendiente, facturada
            $table->text('notas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidaciones');
    }
};
