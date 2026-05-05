<?php

namespace App\Http\Controllers;

use App\Models\Viaje;
use App\Models\Carga;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ViajeController extends Controller
{
    public function index(Request $request)
    {
        $query = Viaje::select('viajes.*')->with([
            'cliente',
            'proveedor',
            'unidad',
            'chofer',
            'carga',
            'gastos',
            'anticipos',
            'remitos.factura.orden_pago.cheques'
        ]);

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $cleanSearch = preg_replace('/^[PT]-0*/i', '', $search);
            $query->where(function ($q) use ($search, $cleanSearch) {
                $q->where('viajes.id', 'like', "%{$cleanSearch}%")
                    ->orWhere('origen', 'like', "%{$search}%")
                    ->orWhere('destino', 'like', "%{$search}%")
                    ->orWhereHas('chofer', function ($cq) use ($search) {
                        $cq->where('nombre', 'like', "%{$search}%")
                            ->orWhere('apellido', 'like', "%{$search}%");
                    })
                    ->orWhereHas('cliente', function ($pq) use ($search) {
                        $pq->where('razon_social', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $sortBy = $request->get('sort_by');
            $sortDir = strtolower($request->get('sort_dir'));

            if ($sortBy === 'estado' && in_array($sortDir, ['pendiente', 'en_curso', 'finalizado', 'cancelado'])) {
                $query->orderByRaw("CASE WHEN estado = ? THEN 0 ELSE 1 END", [$sortDir])
                    ->orderBy('viajes.id', 'desc');
            } else {
                $dir = $sortDir === 'asc' ? 'asc' : 'desc';
                if ($sortBy === 'id') {
                    $query->orderBy('viajes.id', $dir);
                } elseif ($sortBy === 'cliente') {
                    $query->leftJoin('clientes', 'viajes.cliente_id', '=', 'clientes.id')
                        ->orderBy('clientes.razon_social', $dir);
                } elseif ($sortBy === 'proveedor') {
                    $query->leftJoin('proveedores', 'viajes.proveedor_id', '=', 'proveedores.id')
                        ->orderBy('proveedores.razon_social', $dir);
                } elseif ($sortBy === 'chofer') {
                    $query->leftJoin('choferes', 'viajes.chofer_id', '=', 'choferes.id')
                        ->orderBy('choferes.nombre', $dir);
                } elseif ($sortBy === 'unidad') {
                    $query->leftJoin('unidades', 'viajes.unidad_id', '=', 'unidades.id')
                        ->orderBy('unidades.marca', $dir)->orderBy('unidades.patente', $dir);
                } elseif ($sortBy === 'ruta') {
                    $query->orderBy('origen', $dir);
                } elseif ($sortBy === 'precio_pactado') {
                    $query->orderBy('viajes.precio_pactado', $dir);
                } elseif ($sortBy === 'costo_proveedor') {
                    $query->orderBy('viajes.costo_proveedor', $dir);
                } else {
                    $query->orderBy('viajes.id', 'desc');
                }
            }
        } else {
            $query->orderBy('viajes.id', 'desc');
        }

        $viajes = $query->paginate(10);
        return response()->json($viajes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'origen' => 'required|string',
            'destino' => 'required|string',
            'precio_pactado' => 'required|numeric|min:0',
            'costo_proveedor' => 'nullable|numeric|min:0',
            'unidad_id' => 'required|exists:unidades,id',
            'chofer_id' => 'required|exists:choferes,id',
            'km_recorrido' => 'nullable|integer',
            'fecha_salida' => 'nullable|date',
            'hora_salida' => 'nullable|string',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|string',

            // Tarifa
            'tipo_tarifa' => 'nullable|string',
            'tarifa_valor' => 'nullable|numeric|min:0',
            'tarifa_base' => 'nullable|numeric|min:0',

            // Carga
            'carga.descripcion' => 'nullable|string',
            'carga.tipo_carga' => 'nullable|string',
            'carga.peso_kg' => 'nullable|numeric|min:0',
            'carga.cantidad_bultos' => 'nullable|integer|min:0',
            'carga.requiere_refrigeracion' => 'nullable|boolean',
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $viaje = Viaje::create([
            'unidad_id' => $validated['unidad_id'],
            'chofer_id' => $validated['chofer_id'],
            'cliente_id' => $validated['cliente_id'],
            'proveedor_id' => $validated['proveedor_id'] ?? null,
            'estado' => $validated['estado'],
            'origen' => $validated['origen'],
            'destino' => $validated['destino'],
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'hora_salida' => $validated['hora_salida'] ?? null,
            'fecha_llegada' => $validated['fecha_llegada'] ?? null,
            'hora_llegada' => $validated['hora_llegada'] ?? null,
            'precio_pactado' => $validated['precio_pactado'],
            'costo_proveedor' => $validated['costo_proveedor'] ?? 0,
            'km_recorrido' => $validated['km_recorrido'] ?? 0,
            'tipo_tarifa' => $validated['tipo_tarifa'] ?? null,
            'tarifa_valor' => $validated['tarifa_valor'] ?? null,
            'tarifa_base' => $validated['tarifa_base'] ?? null,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        if (!empty($request->input('carga'))) {
            Carga::create([
                'viaje_id' => $viaje->id,
                'descripcion' => $validated['carga']['descripcion'] ?? null,
                'tipo_carga' => $validated['carga']['tipo_carga'] ?? null,
                'peso_kg' => $validated['carga']['peso_kg'] ?? null,
                'cantidad_bultos' => $validated['carga']['cantidad_bultos'] ?? null,
                'requiere_refrigeracion' => $validated['carga']['requiere_refrigeracion'] ?? false,
            ]);
        }

        $viaje->load(['cliente', 'proveedor', 'unidad', 'chofer', 'carga', 'gastos', 'anticipos', 'remitos.factura.orden_pago.cheques']);

        return response()->json($viaje, 201);
    }

    public function update(Request $request, Viaje $viaje)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'origen' => 'required|string',
            'destino' => 'required|string',
            'precio_pactado' => 'required|numeric|min:0',
            'costo_proveedor' => 'nullable|numeric|min:0',
            'unidad_id' => 'required|exists:unidades,id',
            'chofer_id' => 'required|exists:choferes,id',
            'km_recorrido' => 'nullable|integer',
            'fecha_salida' => 'nullable|date',
            'hora_salida' => 'nullable|string',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|string',

            // Tarifa
            'tipo_tarifa' => 'nullable|string',
            'tarifa_valor' => 'nullable|numeric|min:0',
            'tarifa_base' => 'nullable|numeric|min:0',

            // Carga
            'carga.descripcion' => 'nullable|string',
            'carga.tipo_carga' => 'nullable|string',
            'carga.peso_kg' => 'nullable|numeric|min:0',
            'carga.cantidad_bultos' => 'nullable|integer|min:0',
            'carga.requiere_refrigeracion' => 'nullable|boolean',
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $viaje->update([
            'unidad_id' => $validated['unidad_id'],
            'chofer_id' => $validated['chofer_id'],
            'cliente_id' => $validated['cliente_id'],
            'proveedor_id' => $validated['proveedor_id'] ?? null,
            'estado' => $validated['estado'],
            'origen' => $validated['origen'],
            'destino' => $validated['destino'],
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'hora_salida' => $validated['hora_salida'] ?? null,
            'fecha_llegada' => $validated['fecha_llegada'] ?? null,
            'hora_llegada' => $validated['hora_llegada'] ?? null,
            'precio_pactado' => $validated['precio_pactado'],
            'costo_proveedor' => $validated['costo_proveedor'] ?? 0,
            'km_recorrido' => $validated['km_recorrido'] ?? 0,
            'tipo_tarifa' => $validated['tipo_tarifa'] ?? null,
            'tarifa_valor' => $validated['tarifa_valor'] ?? null,
            'tarifa_base' => $validated['tarifa_base'] ?? null,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        if (!empty($request->input('carga'))) {
            $cargaData = [
                'descripcion' => $validated['carga']['descripcion'] ?? null,
                'tipo_carga' => $validated['carga']['tipo_carga'] ?? null,
                'peso_kg' => $validated['carga']['peso_kg'] ?? null,
                'cantidad_bultos' => $validated['carga']['cantidad_bultos'] ?? null,
                'requiere_refrigeracion' => $validated['carga']['requiere_refrigeracion'] ?? false,
            ];

            if ($viaje->carga) {
                $viaje->carga->update($cargaData);
            } else {
                $cargaData['viaje_id'] = $viaje->id;
                Carga::create($cargaData);
            }
        }

        $viaje->refresh();
        $viaje->load(['cliente', 'proveedor', 'unidad', 'chofer', 'carga', 'gastos', 'anticipos', 'remitos.factura.orden_pago.cheques']);

        return response()->json($viaje, 200);
    }

    public function show($id)
    {
        $viaje = Viaje::withTrashed()->with([
            'cliente',
            'proveedor',
            'unidad',
            'chofer',
            'carga',
            'gastos',
            'anticipos',
            'remitos.factura.orden_pago.cheques'
        ])->findOrFail($id);
        return response()->json($viaje);
    }

    public function destroy(Viaje $viaje)
    {
        $viaje->delete();
        return response()->json(['message' => 'Viaje archivado']);
    }

    public function restore($id)
    {
        $viaje = Viaje::withTrashed()->findOrFail($id);
        $viaje->restore();
        return response()->json(['message' => 'Viaje restaurado']);
    }
}
