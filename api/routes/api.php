<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ViajeController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\ChoferController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\GastoController;
use App\Http\Controllers\AnticipoController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\LiquidacionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Resources with Restore capability
$resources = [
    'viajes' => ViajeController::class,
    'unidades' => UnidadController::class,
    'choferes' => ChoferController::class,
    'clientes' => ClienteController::class,
    'proveedores' => ProveedorController::class,
    'gastos' => GastoController::class,
    'anticipos' => AnticipoController::class,
    'documentos' => DocumentoController::class,
    'facturas' => FacturaController::class,
];

foreach ($resources as $name => $controller) {
    Route::apiResource($name, $controller);
    Route::post("/{$name}/{id}/restore", [$controller, 'restore']);
}

// Liquidaciones (with custom endpoints)
Route::apiResource('liquidaciones', LiquidacionController::class);
Route::post('/liquidaciones/{id}/restore', [LiquidacionController::class, 'restore']);
Route::get('/liquidaciones/{id}/viajes-disponibles', [LiquidacionController::class, 'viajesDisponibles']);
Route::post('/liquidaciones/{id}/viajes', [LiquidacionController::class, 'agregarViajes']);
Route::delete('/liquidaciones/{id}/viajes/{viajeId}', [LiquidacionController::class, 'quitarViaje']);
Route::put('/liquidaciones/{id}/viajes/{viajeId}/monto', [LiquidacionController::class, 'actualizarMonto']);
Route::put('/liquidaciones/{id}/estado', [LiquidacionController::class, 'cambiarEstado']);

// Documento file uploads
Route::post('/documentos/{id}/archivos', [DocumentoController::class, 'storeArchivo']);
Route::delete('/documentos/{documentoId}/archivos/{archivoId}', [DocumentoController::class, 'destroyArchivo']);

// Debug & Extra routes
Route::get('/debug-viajes', function () { 
    $start = microtime(true);
    $data = \App\Models\Viaje::all();
    $end = microtime(true);
    return response()->json([
        'time_ms' => ($end - $start) * 1000,
        'count' => count($data),
        'data' => $data
    ]);
});
