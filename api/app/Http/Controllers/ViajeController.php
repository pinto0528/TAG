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
        $query = Viaje::select('viajes.*')->with(['proveedor', 'unidad', 'chofer', 'fletero', 'carga', 'gastos', 'anticipos', 'remitos.factura']);
        
        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo_viaje', 'like', "%{$search}%")
                  ->orWhere('origen', 'like', "%{$search}%")
                  ->orWhere('destino', 'like', "%{$search}%")
                  ->orWhereHas('chofer', function ($cq) use ($search) {
                      $cq->where('nombre', 'like', "%{$search}%")
                         ->orWhere('apellido', 'like', "%{$search}%");
                  })
                  ->orWhereHas('proveedor', function ($pq) use ($search) {
                      $pq->where('razon_social', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $request->get('fecha_desde'));
        }

        if ($request->has('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $request->get('fecha_hasta'));
        }
        
        if ($request->has('sort_by') && $request->has('sort_dir')) {
            $sortBy = $request->get('sort_by');
            $sortDir = strtolower($request->get('sort_dir'));
            
            if ($sortBy === 'estado' && in_array($sortDir, ['pendiente', 'en_curso', 'finalizado', 'cancelado'])) {
                // Para estado, ordenamos para que el estado seleccionado aparezca primero
                $query->orderByRaw("CASE WHEN estado = ? THEN 0 ELSE 1 END", [$sortDir])
                      ->orderBy('viajes.id', 'desc');
            } else {
                $dir = $sortDir === 'asc' ? 'asc' : 'desc';
                if ($sortBy === 'proveedor') {
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
                } elseif ($sortBy === 'precio') {
                    $query->orderBy('viajes.precio', $dir);
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
            'tipo_transporte' => 'required|in:propio,tercerizado',
            'proveedor_id' => 'required|exists:proveedores,id',
            'origen' => 'required|string',
            'destino' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'unidad_id' => 'nullable|exists:unidades,id',
            'chofer_id' => 'nullable|exists:choferes,id',
            'fletero_id' => 'nullable|exists:fleteros,id',
            'km_recorrido' => 'nullable|integer',
            'fecha_salida' => 'nullable|date',
            'hora_salida' => 'nullable|date_format:H:i',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|date_format:H:i',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|string',
            
            // Carga
            'carga.descripcion' => 'nullable|string',
            'carga.tipo_carga' => 'nullable|string',
            'carga.peso_kg' => 'nullable|numeric|min:0',
            'carga.cantidad_bultos' => 'nullable|integer|min:0',
            'carga.requiere_refrigeracion' => 'nullable|boolean',
        ]);

        if ($validated['tipo_transporte'] === 'propio') {
            if (empty($validated['unidad_id']) || empty($validated['chofer_id'])) {
                throw ValidationException::withMessages([
                    'unidad_id' => 'Unidad y Chofer son requeridos para transporte propio.'
                ]);
            }
            $validated['fletero_id'] = null;
        } else {
            if (empty($validated['fletero_id'])) {
                throw ValidationException::withMessages([
                    'fletero_id' => 'El Fletero es requerido para el transporte tercerizado.'
                ]);
            }
            $validated['unidad_id'] = null;
            $validated['chofer_id'] = null;
        }

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $viaje = Viaje::create([
            'unidad_id' => $validated['unidad_id'],
            'chofer_id' => $validated['chofer_id'],
            'proveedor_id' => $validated['proveedor_id'],
            'fletero_id' => $validated['fletero_id'],
            'estado' => $validated['estado'],
            'origen' => $validated['origen'],
            'destino' => $validated['destino'],
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'hora_salida' => $validated['hora_salida'] ?? null,
            'fecha_llegada' => $validated['fecha_llegada'] ?? null,
            'hora_llegada' => $validated['hora_llegada'] ?? null,
            'precio' => $validated['precio'],
            'km_recorrido' => $validated['km_recorrido'] ?? 0,
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

        $viaje->load(['proveedor', 'unidad', 'chofer', 'fletero', 'carga', 'gastos', 'anticipos', 'remitos']);

        return response()->json($viaje, 201);
    }

    public function update(Request $request, Viaje $viaje)
    {
        $validated = $request->validate([
            'tipo_transporte' => 'required|in:propio,tercerizado',
            'proveedor_id' => 'required|exists:proveedores,id',
            'origen' => 'required|string',
            'destino' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'unidad_id' => 'nullable|exists:unidades,id',
            'chofer_id' => 'nullable|exists:choferes,id',
            'fletero_id' => 'nullable|exists:fleteros,id',
            'km_recorrido' => 'nullable|integer',
            'fecha_salida' => 'nullable|date',
            'hora_salida' => 'nullable|date_format:H:i',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|date_format:H:i',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|string',
            
            // Carga
            'carga.descripcion' => 'nullable|string',
            'carga.tipo_carga' => 'nullable|string',
            'carga.peso_kg' => 'nullable|numeric|min:0',
            'carga.cantidad_bultos' => 'nullable|integer|min:0',
            'carga.requiere_refrigeracion' => 'nullable|boolean',
        ]);

        if ($validated['tipo_transporte'] === 'propio') {
            if (empty($validated['unidad_id']) || empty($validated['chofer_id'])) {
                throw ValidationException::withMessages([
                    'unidad_id' => 'Unidad y Chofer son requeridos para transporte propio.'
                ]);
            }
            $validated['fletero_id'] = null;
        } else {
            if (empty($validated['fletero_id'])) {
                throw ValidationException::withMessages([
                    'fletero_id' => 'El Fletero es requerido para el transporte tercerizado.'
                ]);
            }
            $validated['unidad_id'] = null;
            $validated['chofer_id'] = null;
        }

        if (empty($validated['estado'])) {
            $validated['estado'] = 'pendiente';
        }

        $viaje->update([
            'unidad_id' => $validated['unidad_id'],
            'chofer_id' => $validated['chofer_id'],
            'proveedor_id' => $validated['proveedor_id'],
            'fletero_id' => $validated['fletero_id'],
            'estado' => $validated['estado'],
            'origen' => $validated['origen'],
            'destino' => $validated['destino'],
            'fecha_salida' => $validated['fecha_salida'] ?? null,
            'hora_salida' => $validated['hora_salida'] ?? null,
            'fecha_llegada' => $validated['fecha_llegada'] ?? null,
            'hora_llegada' => $validated['hora_llegada'] ?? null,
            'precio' => $validated['precio'],
            'km_recorrido' => $validated['km_recorrido'] ?? 0,
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
        $viaje->load(['proveedor', 'unidad', 'chofer', 'fletero', 'carga', 'gastos', 'anticipos', 'remitos']);

        return response()->json($viaje, 200);
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
