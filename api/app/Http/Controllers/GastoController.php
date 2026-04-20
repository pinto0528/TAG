<?php

namespace App\Http\Controllers;

use App\Models\Gasto;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'tipo' => 'required|string',
            'concepto' => 'nullable|string',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'notas' => 'nullable|string',
        ]);

        $gasto = Gasto::create($validated);

        return response()->json($gasto, 201);
    }

    public function update(Request $request, Gasto $gasto)
    {
        $validated = $request->validate([
            'tipo' => 'sometimes|required|string',
            'concepto' => 'nullable|string',
            'monto' => 'sometimes|required|numeric|min:0',
            'fecha' => 'sometimes|required|date',
            'notas' => 'nullable|string',
        ]);

        $gasto->update($validated);

        return response()->json($gasto);
    }

    public function destroy(Gasto $gasto)
    {
        $gasto->delete();
        return response()->json(null, 204);
    }
}
