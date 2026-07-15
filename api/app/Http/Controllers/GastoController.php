<?php

namespace App\Http\Controllers;

use App\Models\Gasto;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    public function index(Request $request)
    {
        $query = Gasto::query();

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
            'tipo' => 'required|string',
            'clase' => 'required|in:propio,cliente,proveedor',
            'reintegro' => 'required|boolean',
            'concepto' => 'nullable|string',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
            'notas' => 'nullable|string',
        ]);

        $gasto = Gasto::create($validated);
        $gasto->viaje->recalcularCostoViaje();

        return response()->json($gasto, 201);
    }

    public function show($id)
    {
        $gasto = Gasto::withTrashed()->findOrFail($id);
        return response()->json($gasto);
    }

    public function update(Request $request, $id)
    {
        $gasto = Gasto::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'tipo' => 'sometimes|required|string',
            'clase' => 'sometimes|required|in:propio,cliente,proveedor',
            'reintegro' => 'sometimes|required|boolean',
            'concepto' => 'nullable|string',
            'monto' => 'sometimes|required|numeric|min:0',
            'fecha' => 'sometimes|required|date',
            'notas' => 'nullable|string',
        ]);

        $gasto->update($validated);
        $gasto->viaje->recalcularCostoViaje();

        return response()->json($gasto);
    }

    public function destroy($id)
    {
        $gasto = Gasto::findOrFail($id);
        $gasto->delete();
        $gasto->viaje->recalcularCostoViaje();
        return response()->json(['message' => 'Gasto archivado']);
    }

    public function restore($id)
    {
        $gasto = Gasto::withTrashed()->findOrFail($id);
        $gasto->restore();
        $gasto->viaje->recalcularCostoViaje();
        return response()->json(['message' => 'Gasto restaurado']);
    }
}
