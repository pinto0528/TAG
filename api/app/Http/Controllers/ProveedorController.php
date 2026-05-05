<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    public function index(Request $request)
    {
        $query = Proveedor::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('razon_social', 'like', "%{$search}%")
                  ->orWhere('cuit', 'like', "%{$search}%")
                  ->orWhere('contacto', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('with_relations')) {
            $query->with(['unidades', 'choferes']);
        }

        return response()->json($query->orderBy('razon_social', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string',
            'cuit' => 'required|string|unique:proveedores,cuit',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'contacto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $proveedor = Proveedor::create($validated);

        return response()->json($proveedor, 201);
    }

    public function show($id)
    {
        $proveedor = Proveedor::withTrashed()->with(['unidades', 'choferes'])->findOrFail($id);
        return response()->json($proveedor);
    }

    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'razon_social' => 'sometimes|required|string',
            'cuit' => 'sometimes|required|string|unique:proveedores,cuit,' . $id,
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'contacto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $proveedor->update($validated);

        return response()->json($proveedor);
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $proveedor->delete();

        return response()->json(['message' => 'Proveedor archivado exitosamente']);
    }

    public function restore($id)
    {
        $proveedor = Proveedor::withTrashed()->findOrFail($id);
        $proveedor->restore();

        return response()->json(['message' => 'Proveedor restaurado exitosamente']);
    }
}
