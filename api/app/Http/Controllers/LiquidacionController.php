<?php

namespace App\Http\Controllers;

use App\Models\Liquidacion;
use App\Models\Viaje;
use Illuminate\Http\Request;

class LiquidacionController extends Controller
{
    public function index(Request $request)
    {
        $query = Liquidacion::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->get('tipo'));
        }

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->get('cliente_id'));
        }

        if ($request->has('proveedor_id')) {
            $query->where('proveedor_id', $request->get('proveedor_id'));
        }

        return response()->json(
            $query->with(['cliente', 'proveedor', 'viajes' => function ($q) {
                $q->with(['chofer', 'unidades', 'cliente', 'documento', 'gastos', 'anticipos']);
            }])
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|in:cliente,proveedor',
            'cliente_id' => 'nullable|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'fecha_emision' => 'required|date',
            'notas' => 'nullable|string',
            'viaje_ids' => 'nullable|array',
            'viaje_ids.*' => 'exists:viajes,id',
        ]);

        if ($validated['tipo'] === 'cliente' && empty($validated['cliente_id'])) {
            return response()->json(['message' => 'cliente_id es requerido para liquidaciones de cliente'], 422);
        }
        if ($validated['tipo'] === 'proveedor' && empty($validated['proveedor_id'])) {
            return response()->json(['message' => 'proveedor_id es requerido para liquidaciones de proveedor'], 422);
        }

        $viajeIds = $validated['viaje_ids'] ?? [];
        unset($validated['viaje_ids']);

        $validated['numero'] = $this->generateNumero($validated['tipo']);
        $validated['total'] = 0;
        $validated['estado'] = 'borrador';

        $liquidacion = Liquidacion::create($validated);

        if (!empty($viajeIds)) {
            $viajes = Viaje::whereIn('id', $viajeIds)->get();
            foreach ($viajes as $v) {
                $monto = $validated['tipo'] === 'proveedor' ? ($v->costo_proveedor_ajustado ?? $v->costo_viaje ?? 0) : $v->precio_pactado;
                $liquidacion->viajes()->attach($v->id, ['monto' => $monto]);
            }
            $this->recalcularTotal($liquidacion);
        }

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']), 201);
    }

    public function show($id)
    {
        $liquidacion = Liquidacion::withTrashed()
            ->with(['cliente', 'proveedor', 'viajes' => function ($q) {
                $q->with(['chofer', 'unidades', 'cliente', 'documento', 'gastos', 'anticipos']);
            }, 'factura'])
            ->findOrFail($id);
        return response()->json($liquidacion);
    }

    public function update(Request $request, $id)
    {
        $liquidacion = Liquidacion::withTrashed()->findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se puede editar una liquidación en estado borrador'], 422);
        }

        $validated = $request->validate([
            'notas' => 'nullable|string',
            'fecha_emision' => 'sometimes|required|date',
        ]);

        $liquidacion->update($validated);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function destroy($id)
    {
        $liquidacion = Liquidacion::findOrFail($id);
        $liquidacion->delete();
        return response()->json(['message' => 'Liquidación archivada']);
    }

    public function restore($id)
    {
        $liquidacion = Liquidacion::withTrashed()->findOrFail($id);
        $liquidacion->restore();
        return response()->json(['message' => 'Liquidación restaurada']);
    }

    public function viajesDisponibles(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        $query = Viaje::query()
            ->where('estado', '!=', 'cancelado');

        if ($liquidacion->tipo === 'cliente') {
            $query->where('cliente_id', $liquidacion->cliente_id);
        } else {
            $query->where('proveedor_id', $liquidacion->proveedor_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('origen')) {
            $query->where('origen', 'like', "%{$request->get('origen')}%");
        }

        if ($request->filled('destino')) {
            $query->where('destino', 'like', "%{$request->get('destino')}%");
        }

        $viajesYaEnLiquidacion = $liquidacion->viajes()->pluck('viajes.id');
        $query->whereNotIn('viajes.id', $viajesYaEnLiquidacion);

        $viajesYaEnMismoTipo = \DB::table('liquidacion_viaje')
            ->join('liquidaciones', 'liquidaciones.id', '=', 'liquidacion_viaje.liquidacion_id')
            ->where('liquidaciones.tipo', $liquidacion->tipo)
            ->where('liquidaciones.id', '!=', $liquidacion->id)
            ->pluck('liquidacion_viaje.viaje_id');
        $query->whereNotIn('viajes.id', $viajesYaEnMismoTipo);

        $viajes = $query->with(['cliente', 'proveedor', 'unidades', 'chofer', 'documento', 'gastos', 'anticipos'])
            ->orderBy('fecha_salida', 'desc')
            ->get();

        return response()->json($viajes);
    }

    public function agregarViajes(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden agregar viajes en estado borrador'], 422);
        }

        $validated = $request->validate([
            'viajes' => 'required|array',
            'viajes.*.viaje_id' => 'required|exists:viajes,id',
            'viajes.*.monto' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['viajes'] as $item) {
            $viaje = Viaje::findOrFail($item['viaje_id']);
            $monto = $item['monto'] ?? ($liquidacion->tipo === 'proveedor'
                ? ($viaje->costo_proveedor_ajustado ?? $viaje->costo_viaje ?? 0)
                : $viaje->precio_pactado);

            $liquidacion->viajes()->attach($item['viaje_id'], ['monto' => $monto]);
        }

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function quitarViaje($id, $viajeId)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden quitar viajes en estado borrador'], 422);
        }

        $liquidacion->viajes()->detach($viajeId);

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function actualizarMonto(Request $request, $id, $viajeId)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden editar montos en estado borrador'], 422);
        }

        $validated = $request->validate([
            'monto' => 'required|numeric|min:0',
        ]);

        $liquidacion->viajes()->updateExistingPivot($viajeId, ['monto' => $validated['monto']]);

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function cambiarEstado(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|string|in:borrador,pendiente,facturada',
        ]);

        $liquidacion->update(['estado' => $validated['estado']]);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    private function generateNumero(string $tipo): string
    {
        $prefijo = $tipo === 'cliente' ? 'LIQ-C' : 'LIQ-P';
        $ultimo = Liquidacion::withTrashed()->where('numero', 'like', "{$prefijo}-%")
            ->latest('id')
            ->first();

        if ($ultimo && preg_match('/(\d+)$/', $ultimo->numero, $matches)) {
            $siguiente = intval($matches[1]) + 1;
        } else {
            $siguiente = 1;
        }

        return $prefijo . '-' . str_pad($siguiente, 4, '0', STR_PAD_LEFT);
    }

    private function recalcularTotal(Liquidacion $liquidacion): void
    {
        $total = \DB::table('liquidacion_viaje')
            ->where('liquidacion_id', $liquidacion->id)
            ->sum('monto');
        $liquidacion->update(['total' => $total]);
    }
}
