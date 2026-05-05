<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            if (!Schema::hasColumn('facturas', 'viaje_id')) {
                $table->foreignId('viaje_id')->nullable()->after('id')->constrained('viajes')->cascadeOnDelete();
            }
        });

        Schema::table('ordenes_pago', function (Blueprint $table) {
            if (!Schema::hasColumn('ordenes_pago', 'viaje_id')) {
                $table->foreignId('viaje_id')->nullable()->after('id')->constrained('viajes')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('ordenes_pago', 'proveedor_id')) {
                $table->foreignId('proveedor_id')->nullable()->after('viaje_id')->constrained('proveedores')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropForeign(['viaje_id']);
            $table->dropColumn('viaje_id');
        });

        Schema::table('ordenes_pago', function (Blueprint $table) {
            $table->dropForeign(['viaje_id']);
            $table->dropForeign(['proveedor_id']);
            $table->dropColumn(['viaje_id', 'proveedor_id']);
        });
    }
};
