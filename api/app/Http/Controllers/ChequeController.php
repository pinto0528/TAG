<?php

namespace App\Http\Controllers;

use App\Models\Cheque;
use Illuminate\Http\Request;

class ChequeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'orden_pago_id' => 'required|exists:ordenes_pago,id',
            'numero' => 'required|string',
            'banco' => 'required|string',
            'fecha_emision' => 'required|date',
            'fecha_cobro' => 'nullable|date',
            'monto' => 'required|numeric|min:0',
            'beneficiario' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $cheque = Cheque::create($validated);

        return response()->json($cheque, 201);
    }

    public function update(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'numero' => 'sometimes|required|string',
            'banco' => 'sometimes|required|string',
            'fecha_emision' => 'sometimes|required|date',
            'fecha_cobro' => 'nullable|date',
            'monto' => 'sometimes|required|numeric|min:0',
            'beneficiario' => 'nullable|string',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $cheque->update($validated);

        return response()->json($cheque);
    }

    public function destroy(Cheque $cheque)
    {
        $cheque->delete();
        return response()->json(null, 204);
    }
}
