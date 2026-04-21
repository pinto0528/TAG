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
            'remito_ids' => 'required|array',
            'remito_ids.*' => 'exists:remitos,id',
        ]);

        $remito_ids = $validated['remito_ids'];
        unset($validated['remito_ids']);

        $factura = DB::transaction(function () use ($validated, $remito_ids) {
            $factura = Factura::create($validated);
            
            // Link specific remitos
            Remito::whereIn('id', $remito_ids)->update(['factura_id' => $factura->id]);
                  
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
