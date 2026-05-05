<?php

namespace App\Http\Controllers;

use App\Models\OrdenPago;
use Illuminate\Http\Request;

class OrdenPagoController extends Controller
{
    public function index(Request $request)
    {
        $query = OrdenPago::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('viaje_id')) {
            $query->where('viaje_id', $request->get('viaje_id'));
        }

        if ($request->has('factura_id')) {
            $query->where('factura_id', $request->get('factura_id'));
        }

        return response()->json($query->orderBy('fecha', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'factura_id' => 'required|exists:facturas,id',
            'viaje_id' => 'nullable|exists:viajes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'numero' => 'required|string',
            'fecha' => 'required|date',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $ordenPago = OrdenPago::create($validated);

        return response()->json($ordenPago, 201);
    }

    public function show($id)
    {
        $ordenPago = OrdenPago::withTrashed()->with('cheques')->findOrFail($id);
        return response()->json($ordenPago);
    }

    public function update(Request $request, $id)
    {
        $ordenPago = OrdenPago::withTrashed()->findOrFail($id);

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

    public function destroy($id)
    {
        $ordenPago = OrdenPago::findOrFail($id);
        $ordenPago->delete();
        return response()->json(['message' => 'Orden de Pago archivada']);
    }

    public function restore($id)
    {
        $ordenPago = OrdenPago::withTrashed()->findOrFail($id);
        $ordenPago->restore();
        return response()->json(['message' => 'Orden de Pago restaurada']);
    }
}
