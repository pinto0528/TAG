<?php

namespace App\Http\Controllers;

use App\Models\Unidad;
use Illuminate\Http\Request;

class UnidadController extends Controller
{
    public function index(Request $request)
    {
        $query = Unidad::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('patente', 'like', "%{$search}%")
                  ->orWhere('marca', 'like', "%{$search}%")
                  ->orWhere('modelo', 'like', "%{$search}%")
                  ->orWhere('numero', 'like', "%{$search}%")
                  ->orWhere('numero_interno', 'like', "%{$search}%");
            });
        }

        if ($request->has('proveedor_id')) {
            $provId = $request->get('proveedor_id');
            if ($provId === 'propio' || $provId === 'null') {
                $query->whereNull('proveedor_id');
            } else {
                $query->where('proveedor_id', $provId);
            }
        }

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patente' => 'required|string|unique:unidades,patente',
            'marca' => 'nullable|string',
            'modelo' => 'nullable|string',
            'anio' => 'nullable|integer',
            'tipo' => 'nullable|string',
            'numero' => 'nullable|string',
            'numero_interno' => 'nullable|string',
            'vtv_vencimiento' => 'nullable|date',
            'seguro_vencimiento' => 'nullable|date',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'activo' => 'boolean',
        ]);

        $unidad = Unidad::create($validated);

        return response()->json($unidad, 201);
    }

    public function show($id)
    {
        $unidad = Unidad::withTrashed()->findOrFail($id);
        return response()->json($unidad);
    }

    public function update(Request $request, $id)
    {
        $unidade = Unidad::withTrashed()->findOrFail($id);
        
        $validated = $request->validate([
            'patente' => 'sometimes|required|string|unique:unidades,patente,' . $id,
            'marca' => 'nullable|string',
            'modelo' => 'nullable|string',
            'anio' => 'nullable|integer',
            'tipo' => 'nullable|string',
            'numero' => 'nullable|string',
            'numero_interno' => 'nullable|string',
            'vtv_vencimiento' => 'nullable|date',
            'seguro_vencimiento' => 'nullable|date',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'activo' => 'boolean',
        ]);

        $unidade->update($validated);

        return response()->json($unidade);
    }

    public function destroy($id)
    {
        $unidade = Unidad::findOrFail($id);
        $unidade->delete();

        return response()->json(['message' => 'Unidad archivada exitosamente']);
    }

    public function restore($id)
    {
        $unidade = Unidad::withTrashed()->findOrFail($id);
        $unidade->restore();

        return response()->json(['message' => 'Unidad restaurada exitosamente']);
    }
}
