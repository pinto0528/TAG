<?php

namespace App\Http\Controllers;

use App\Models\OrdenPago;
use Illuminate\Http\Request;

class OrdenPagoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'factura_id' => 'required|exists:facturas,id',
            'numero' => 'required|string',
            'fecha' => 'required|date',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $ordenPago = OrdenPago::create($validated);

        return response()->json($ordenPago, 201);
    }

    public function update(Request $request, OrdenPago $ordenPago)
    {
        $validated = $request->validate([
            'numero' => 'sometimes|required|string',
            'fecha' => 'sometimes|required|date',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $ordenPago->update($validated);

        return response()->json($ordenPago);
    }

    public function destroy(OrdenPago $ordenPago)
    {
        $ordenPago->delete();
        return response()->json(null, 204);
    }
}
