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
use App\Http\Controllers\RemitoController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\OrdenPagoController;
use App\Http\Controllers\ChequeController;

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
    'remitos' => RemitoController::class,
    'facturas' => FacturaController::class,
    'ordenes-pago' => OrdenPagoController::class,
    'cheques' => ChequeController::class,
];

foreach ($resources as $name => $controller) {
    Route::apiResource($name, $controller);
    Route::post("/{$name}/{id}/restore", [$controller, 'restore']);
}

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
