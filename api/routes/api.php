<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ViajeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/viajes', [ViajeController::class, 'index']);
Route::post('/viajes', [ViajeController::class, 'store']);
Route::put('/viajes/{viaje}', [ViajeController::class, 'update']);
Route::delete('/viajes/{viaje}', [ViajeController::class, 'destroy']);
Route::post('/viajes/{id}/restore', [ViajeController::class, 'restore']);

Route::get('/proveedores', function () { return \App\Models\Proveedor::all(); });
Route::get('/unidades', function () { return \App\Models\Unidad::all(); });
Route::get('/choferes', function () { return \App\Models\Chofer::all(); });
Route::get('/fleteros', function () { return \App\Models\Fletero::all(); });
