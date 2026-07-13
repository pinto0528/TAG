<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function index(Request $request)
    {
        $query = Factura::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('liquidacion_id')) {
            $query->where('liquidacion_id', $request->get('liquidacion_id'));
        }

        return response()->json(
            $query->with(['liquidacion', 'liquidacion.cliente', 'liquidacion.proveedor'])
                ->orderBy('fecha_emision', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'liquidacion_id' => 'required|exists:liquidaciones,id',
            'numero' => 'required|string|unique:facturas,numero',
            'tipo' => 'nullable|string',
            'punto_venta' => 'nullable|string',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date',
            'monto_neto' => 'nullable|numeric|min:0',
            'iva' => 'nullable|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $factura = Factura::create($validated);

        return response()->json($factura->load('liquidacion'), 201);
    }

    public function show($id)
    {
        $factura = Factura::withTrashed()
            ->with(['liquidacion', 'liquidacion.cliente', 'liquidacion.proveedor', 'liquidacion.viajes'])
            ->findOrFail($id);
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
            'fecha_vencimiento' => 'nullable|date',
            'monto_neto' => 'sometimes|required|numeric|min:0',
            'iva' => 'sometimes|required|numeric|min:0',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'estado' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);

        $factura->update($validated);

        return response()->json($factura->load('liquidacion'));
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
