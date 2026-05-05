<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use App\Models\Remito;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function index(Request $request)
    {
        $query = Factura::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('viaje_id')) {
            $query->where('viaje_id', $request->get('viaje_id'));
        }

        return response()->json($query->orderBy('fecha_emision', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'numero' => 'required|string|unique:facturas,numero',
            'tipo' => 'nullable|string',
            'punto_venta' => 'nullable|string',
            'fecha_emision' => 'required|date',
            'monto_neto' => 'nullable|numeric|min:0',
            'iva' => 'nullable|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'nullable|string',
            'remito_ids' => 'required|array',
            'remito_ids.*' => 'exists:remitos,id',
        ]);

        $factura = Factura::create($validated);

        // Link Remitos to this Factura
        Remito::whereIn('id', $validated['remito_ids'])->update(['factura_id' => $factura->id]);

        return response()->json($factura->load('remitos'), 201);
    }

    public function show($id)
    {
        $factura = Factura::withTrashed()->with('remitos')->findOrFail($id);
        return response()->json($factura);
    }

    public function update(Request $request, $id)
    {
        $factura = Factura::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'numero' => 'sometimes|required|string|unique:facturas,numero,' . $id,
            'tipo' => 'nullable|string',
            'punto_venta' => 'nullable|string',
            'fecha_emision' => 'sometimes|required|date',
            'monto_neto' => 'sometimes|required|numeric|min:0',
            'iva' => 'sometimes|required|numeric|min:0',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'estado' => 'nullable|string',
        ]);

        $factura->update($validated);

        return response()->json($factura);
    }

    public function destroy($id)
    {
        $factura = Factura::findOrFail($id);
        $factura->delete();
        return response()->json(['message' => 'Factura archivada']);
    }

    public function restore($id)
    {
        $factura = Factura::withTrashed()->findOrFail($id);
        $factura->restore();
        return response()->json(['message' => 'Factura restaurada']);
    }
}
