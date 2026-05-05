<?php

namespace App\Http\Controllers;

use App\Models\Remito;
use Illuminate\Http\Request;

class RemitoController extends Controller
{
    public function index(Request $request)
    {
        $query = Remito::query();

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
            'factura_id' => 'nullable|exists:facturas,id',
            'numero' => 'required|string',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $remito = Remito::create($validated);

        return response()->json($remito, 201);
    }

    public function show($id)
    {
        $remito = Remito::withTrashed()->findOrFail($id);
        return response()->json($remito);
    }

    public function update(Request $request, $id)
    {
        $remito = Remito::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'factura_id' => 'nullable|exists:facturas,id',
            'numero' => 'sometimes|required|string',
            'fecha' => 'sometimes|required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $remito->update($validated);

        return response()->json($remito);
    }

    public function destroy($id)
    {
        $remito = Remito::findOrFail($id);
        $remito->delete();
        return response()->json(['message' => 'Remito archivado']);
    }

    public function restore($id)
    {
        $remito = Remito::withTrashed()->findOrFail($id);
        $remito->restore();
        return response()->json(['message' => 'Remito restaurado']);
    }
}
