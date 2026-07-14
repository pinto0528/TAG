<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unidades', function (Blueprint $table) {
            $table->string('numero')->nullable()->after('tipo');
        });

        Schema::table('choferes', function (Blueprint $table) {
            $table->string('numero')->nullable()->after('proveedor_id');
        });
    }

    public function down(): void
    {
        Schema::table('unidades', function (Blueprint $table) {
            $table->dropColumn('numero');
        });

        Schema::table('choferes', function (Blueprint $table) {
            $table->dropColumn('numero');
        });
    }
};
