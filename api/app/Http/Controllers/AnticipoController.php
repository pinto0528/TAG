<?php

namespace App\Http\Controllers;

use App\Models\Anticipo;
use Illuminate\Http\Request;

class AnticipoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'concepto' => 'required|string',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'metodo_pago' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $anticipo = Anticipo::create($validated);

        return response()->json($anticipo, 201);
    }

    public function update(Request $request, Anticipo $anticipo)
    {
        $validated = $request->validate([
            'concepto' => 'sometimes|required|string',
            'monto' => 'sometimes|required|numeric|min:0',
            'fecha' => 'sometimes|required|date',
            'metodo_pago' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $anticipo->update($validated);

        return response()->json($anticipo);
    }

    public function destroy(Anticipo $anticipo)
    {
        $anticipo->delete();
        return response()->json(null, 204);
    }
}
