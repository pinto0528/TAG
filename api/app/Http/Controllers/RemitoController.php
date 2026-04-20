<?php

namespace App\Http\Controllers;

use App\Models\Remito;
use Illuminate\Http\Request;

class RemitoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'numero' => 'nullable|string',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'required|string|in:pendiente,conforme,rechazado',
            'notas' => 'nullable|string',
        ]);

        $remito = Remito::create($validated);

        return response()->json($remito, 201);
    }

    public function destroy(Remito $remito)
    {
        $remito->delete();
        return response()->json(null, 204);
    }
}
