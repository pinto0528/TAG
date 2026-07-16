<?php

namespace App\Http\Controllers;

use App\Models\Chofer;
use Illuminate\Http\Request;

class ChoferController extends Controller
{
    public function index(Request $request)
    {
        $query = Chofer::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('numero', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
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
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'numero' => 'nullable|string',
            'dni' => 'nullable|string|unique:choferes,dni',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string',
            'fecha_nacimiento' => 'nullable|date',
            'licencia_vencimiento' => 'nullable|date',
            'linti_vencimiento' => 'nullable|date',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'activo' => 'boolean',
        ]);

        $chofer = Chofer::create($validated);

        if ($request->filled('numero')) {
            $duplicado = Chofer::where('numero', $request->numero)
                ->where('proveedor_id', $request->proveedor_id)
                ->where('id', '!=', $chofer->id)
                ->exists();
            if ($duplicado) {
                $chofer->delete();
                return response()->json(['errors' => ['numero' => ['El número ya existe en esta flota']]], 422);
            }
        }

        return response()->json($chofer, 201);
    }

    public function show($id)
    {
        $chofer = Chofer::withTrashed()->findOrFail($id);
        return response()->json($chofer);
    }

    public function update(Request $request, $id)
    {
        $chofer = Chofer::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string',
            'apellido' => 'sometimes|required|string',
            'numero' => 'nullable|string',
            'dni' => 'nullable|string|unique:choferes,dni,' . $id,
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string',
            'fecha_nacimiento' => 'nullable|date',
            'licencia_vencimiento' => 'nullable|date',
            'linti_vencimiento' => 'nullable|date',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'activo' => 'boolean',
        ]);

        $chofer->update($validated);

        if ($request->filled('numero')) {
            $duplicado = Chofer::where('numero', $request->numero)
                ->where('proveedor_id', $request->proveedor_id)
                ->where('id', '!=', $id)
                ->exists();
            if ($duplicado) {
                return response()->json(['errors' => ['numero' => ['El número ya existe en esta flota']]], 422);
            }
        }

        return response()->json($chofer);
    }

    public function destroy($id)
    {
        $chofer = Chofer::findOrFail($id);
        $chofer->delete();

        return response()->json(['message' => 'Chofer archivado exitosamente']);
    }

    public function restore($id)
    {
        $chofer = Chofer::withTrashed()->findOrFail($id);
        $chofer->restore();

        return response()->json(['message' => 'Chofer restaurado exitosamente']);
    }
}
