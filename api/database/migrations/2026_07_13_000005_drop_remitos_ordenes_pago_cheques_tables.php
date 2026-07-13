<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('cheques');
        Schema::dropIfExists('ordenes_pago');
        Schema::dropIfExists('remitos');
    }

    public function down(): void
    {
        Schema::create('remitos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viaje_id')->constrained('viajes')->cascadeOnDelete();
            $table->foreignId('factura_id')->nullable()->constrained('facturas')->nullOnDelete();
            $table->string('numero')->nullable();
            $table->date('fecha');
            $table->string('descripcion')->nullable();
            $table->string('estado')->default('pendiente');
            $table->text('notas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ordenes_pago', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factura_id')->constrained('facturas')->cascadeOnDelete();
            $table->foreignId('viaje_id')->nullable()->constrained('viajes')->cascadeOnDelete();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->cascadeOnDelete();
            $table->string('numero')->nullable();
            $table->date('fecha');
            $table->decimal('monto_total', 12, 2);
            $table->string('estado')->default('pendiente');
            $table->text('notas')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_pago_id')->constrained('ordenes_pago')->cascadeOnDelete();
            $table->string('numero');
            $table->string('banco');
            $table->date('fecha_emision');
            $table->date('fecha_cobro')->nullable();
            $table->decimal('monto', 12, 2);
            $table->string('beneficiario')->nullable();
            $table->string('estado')->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
};
