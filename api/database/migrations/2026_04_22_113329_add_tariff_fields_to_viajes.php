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
            $table->string('tipo_tarifa')->nullable(); // fija, tonelada, bulto, km
            $table->decimal('tarifa_valor', 15, 2)->nullable();
            $table->decimal('tarifa_base', 15, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->dropColumn(['tipo_tarifa', 'tarifa_valor', 'tarifa_base']);
        });
    }
};
