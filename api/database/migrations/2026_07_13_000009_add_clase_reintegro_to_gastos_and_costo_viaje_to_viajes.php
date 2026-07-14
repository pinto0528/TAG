<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->string('clase')->nullable()->after('tipo');
            $table->boolean('reintegro')->default(false)->after('clase');
        });

        Schema::table('viajes', function (Blueprint $table) {
            $table->decimal('costo_viaje', 12, 2)->default(0)->after('costo_proveedor');
        });
    }

    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropColumn(['clase', 'reintegro']);
        });

        Schema::table('viajes', function (Blueprint $table) {
            $table->dropColumn('costo_viaje');
        });
    }
};
