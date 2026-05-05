<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Cliente::query();

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

        return response()->json($query->orderBy('razon_social', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string',
            'cuit' => 'required|string|unique:clientes,cuit',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'contacto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $cliente = Cliente::create($validated);

        return response()->json($cliente, 201);
    }

    public function show($id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);
        return response()->json($cliente);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'razon_social' => 'sometimes|required|string',
            'cuit' => 'sometimes|required|string|unique:clientes,cuit,' . $id,
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'contacto' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $cliente->update($validated);

        return response()->json($cliente);
    }

    public function destroy($id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();

        return response()->json(['message' => 'Cliente archivado exitosamente']);
    }

    public function restore($id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);
        $cliente->restore();

        return response()->json(['message' => 'Cliente restaurado exitosamente']);
    }
}
