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
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'dni' => 'nullable|string|unique:choferes,dni',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string',
            'fecha_nacimiento' => 'nullable|date',
            'licencia_vencimiento' => 'nullable|date',
            'linti_vencimiento' => 'nullable|date',
            'activo' => 'boolean',
        ]);

        $chofer = Chofer::create($validated);

        return response()->json($chofer, 201);
    }

    public function show(Chofer $chofer)
    {
        return response()->json($chofer);
    }

    public function update(Request $request, $id)
    {
        $chofer = Chofer::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string',
            'apellido' => 'sometimes|required|string',
            'dni' => 'nullable|string|unique:choferes,dni,' . $id,
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string',
            'fecha_nacimiento' => 'nullable|date',
            'licencia_vencimiento' => 'nullable|date',
            'linti_vencimiento' => 'nullable|date',
            'activo' => 'boolean',
        ]);

        $chofer->update($validated);

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
