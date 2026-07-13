<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\Request;

class DocumentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Documento::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('viaje_id')) {
            $query->where('viaje_id', $request->get('viaje_id'));
        }

        return response()->json($query->with('viaje')->orderBy('fecha', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'tipo' => 'required|string|in:REMITO,CARTA_DE_PORTE,HOJA_DE_RUTA',
            'numero' => 'required|string',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|in:pendiente,conforme,rechazado',
            'notas' => 'nullable|string',
        ]);

        $documento = Documento::create($validated);

        return response()->json($documento->load('viaje'), 201);
    }

    public function show($id)
    {
        $documento = Documento::withTrashed()->with('viaje')->findOrFail($id);
        return response()->json($documento);
    }

    public function update(Request $request, $id)
    {
        $documento = Documento::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|in:REMITO,CARTA_DE_PORTE,HOJA_DE_RUTA',
            'numero' => 'sometimes|required|string',
            'fecha' => 'sometimes|required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|in:pendiente,conforme,rechazado',
            'notas' => 'nullable|string',
        ]);

        $documento->update($validated);

        return response()->json($documento->load('viaje'));
    }

    public function destroy($id)
    {
        $documento = Documento::findOrFail($id);
        $documento->delete();
        return response()->json(['message' => 'Documento archivado']);
    }

    public function restore($id)
    {
        $documento = Documento::withTrashed()->findOrFail($id);
        $documento->restore();
        return response()->json(['message' => 'Documento restaurado']);
    }
}
