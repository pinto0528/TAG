<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->index('cliente_id');
            $table->index('proveedor_id');
            $table->index('unidad_id');
            $table->index('chofer_id');
            $table->index('estado');
            $table->index('fecha_salida');
        });

        Schema::table('unidades', function (Blueprint $table) {
            $table->index('proveedor_id');
        });

        Schema::table('choferes', function (Blueprint $table) {
            $table->index('proveedor_id');
        });

        Schema::table('cargas', function (Blueprint $table) {
            $table->index('viaje_id');
        });

        Schema::table('remitos', function (Blueprint $table) {
            $table->index('viaje_id');
            $table->index('factura_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->dropIndex(['cliente_id', 'proveedor_id', 'unidad_id', 'chofer_id', 'estado', 'fecha_salida']);
        });

        Schema::table('unidades', function (Blueprint $table) {
            $table->dropIndex(['proveedor_id']);
        });

        Schema::table('choferes', function (Blueprint $table) {
            $table->dropIndex(['proveedor_id']);
        });

        Schema::table('cargas', function (Blueprint $table) {
            $table->dropIndex(['viaje_id']);
        });

        Schema::table('remitos', function (Blueprint $table) {
            $table->dropIndex(['viaje_id', 'factura_id']);
        });
    }
};
