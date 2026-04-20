<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use App\Models\Remito;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FacturaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|unique:facturas,numero',
            'tipo' => 'required|string|in:A,B,C',
            'punto_venta' => 'nullable|string',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date',
            'monto_neto' => 'required|numeric|min:0',
            'iva' => 'required|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'required|string|in:pendiente,pagada,anulada',
            'notas' => 'nullable|string',
            'viaje_id' => 'required|exists:viajes,id', // Needed to link via Remitos or directly to the UI
        ]);

        $viaje_id = $validated['viaje_id'];
        unset($validated['viaje_id']);

        $factura = DB::transaction(function () use ($validated, $viaje_id) {
            $factura = Factura::create($validated);
            
            // We link all remitos of this trip that don't have a factura yet
            Remito::where('viaje_id', $viaje_id)
                  ->whereNull('factura_id')
                  ->update(['factura_id' => $factura->id]);
                  
            return $factura;
        });

        return response()->json($factura, 201);
    }

    public function destroy(Factura $factura)
    {
        $factura->delete();
        return response()->json(null, 204);
    }
}
