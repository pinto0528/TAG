<?php

namespace App\Http\Controllers;

use App\Models\Cheque;
use Illuminate\Http\Request;

class ChequeController extends Controller
{
    public function index(Request $request)
    {
        $query = Cheque::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('orden_pago_id')) {
            $query->where('orden_pago_id', $request->get('orden_pago_id'));
        }

        return response()->json($query->orderBy('fecha_emision', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'orden_pago_id' => 'required|exists:ordenes_pago,id',
            'numero' => 'required|string',
            'banco' => 'required|string',
            'monto' => 'required|numeric|min:0',
            'fecha_emision' => 'required|date',
            'fecha_cobro' => 'nullable|date',
            'beneficiario' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $cheque = Cheque::create($validated);

        return response()->json($cheque, 201);
    }

    public function show($id)
    {
        $cheque = Cheque::withTrashed()->findOrFail($id);
        return response()->json($cheque);
    }

    public function update(Request $request, $id)
    {
        $cheque = Cheque::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'numero' => 'sometimes|required|string',
            'banco' => 'sometimes|required|string',
            'monto' => 'sometimes|required|numeric|min:0',
            'fecha_emision' => 'sometimes|required|date',
            'fecha_cobro' => 'nullable|date',
            'beneficiario' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $cheque->update($validated);

        return response()->json($cheque);
    }

    public function destroy($id)
    {
        $cheque = Cheque::findOrFail($id);
        $cheque->delete();
        return response()->json(['message' => 'Cheque archivado']);
    }

    public function restore($id)
    {
        $cheque = Cheque::withTrashed()->findOrFail($id);
        $cheque->restore();
        return response()->json(['message' => 'Cheque restaurado']);
    }
}
