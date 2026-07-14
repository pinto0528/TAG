<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documento_archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_id')->constrained('documentos')->cascadeOnDelete();
            $table->string('archivo_path');
            $table->string('archivo_nombre');
            $table->string('archivo_mime');
            $table->unsignedBigInteger('archivo_size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documento_archivos');
    }
};
