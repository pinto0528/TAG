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
        $query = Viaje::with(['proveedor', 'unidad', 'chofer', 'fletero', 'carga', 'gastos', 'anticipos', 'remitos']);
        
        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }
        
        $viajes = $query->orderBy('id', 'desc')->get();
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
