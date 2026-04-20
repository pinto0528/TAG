<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ViajeController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\ChoferController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('viajes', ViajeController::class);
Route::post('/viajes/{id}/restore', [ViajeController::class, 'restore']);

Route::apiResource('unidades', UnidadController::class);
Route::post('/unidades/{id}/restore', [UnidadController::class, 'restore']);

Route::apiResource('choferes', ChoferController::class);
Route::post('/choferes/{id}/restore', [ChoferController::class, 'restore']);

Route::get('/proveedores', function () { return \App\Models\Proveedor::all(); });
Route::get('/fleteros', function () { return \App\Models\Fletero::all(); });

Route::apiResource('gastos', \App\Http\Controllers\GastoController::class)->only(['store', 'update', 'destroy']);
Route::apiResource('anticipos', \App\Http\Controllers\AnticipoController::class)->only(['store', 'update', 'destroy']);
Route::apiResource('remitos', \App\Http\Controllers\RemitoController::class)->only(['store', 'destroy']);
Route::apiResource('facturas', \App\Http\Controllers\FacturaController::class)->only(['store', 'destroy']);
