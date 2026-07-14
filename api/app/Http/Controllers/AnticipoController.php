<?php

namespace App\Http\Controllers;

use App\Models\Anticipo;
use Illuminate\Http\Request;

class AnticipoController extends Controller
{
    public function index(Request $request)
    {
        $query = Anticipo::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('viaje_id')) {
            $query->where('viaje_id', $request->get('viaje_id'));
        }

        return response()->json($query->orderBy('fecha', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'metodo_pago' => 'nullable|string',
            'concepto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $anticipo = Anticipo::create($validated);
        $anticipo->viaje->recalcularCostoViaje();

        return response()->json($anticipo, 201);
    }

    public function show($id)
    {
        $anticipo = Anticipo::withTrashed()->findOrFail($id);
        return response()->json($anticipo);
    }

    public function update(Request $request, $id)
    {
        $anticipo = Anticipo::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'monto' => 'sometimes|required|numeric|min:0',
            'fecha' => 'sometimes|required|date',
            'metodo_pago' => 'nullable|string',
            'concepto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $anticipo->update($validated);
        $anticipo->viaje->recalcularCostoViaje();

        return response()->json($anticipo);
    }

    public function destroy($id)
    {
        $anticipo = Anticipo::findOrFail($id);
        $anticipo->delete();
        $anticipo->viaje->recalcularCostoViaje();
        return response()->json(['message' => 'Anticipo archivado']);
    }

    public function restore($id)
    {
        $anticipo = Anticipo::withTrashed()->findOrFail($id);
        $anticipo->restore();
        $anticipo->viaje->recalcularCostoViaje();
        return response()->json(['message' => 'Anticipo restaurado']);
    }
}
