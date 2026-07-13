<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropForeign(['viaje_id']);
            $table->dropColumn('viaje_id');
            $table->foreignId('liquidacion_id')->nullable()->after('id')->constrained('liquidaciones');
        });
    }

    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropForeign(['liquidacion_id']);
            $table->dropColumn('liquidacion_id');
            $table->foreignId('viaje_id')->nullable()->after('id')->constrained('viajes')->cascadeOnDelete();
        });
    }
};
