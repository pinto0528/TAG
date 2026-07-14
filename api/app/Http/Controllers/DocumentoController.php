<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use App\Models\DocumentoArchivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Documento::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('viaje_id')) {
            $query->where('viaje_id', $request->get('viaje_id'));
        }

        return response()->json($query->with(['viaje', 'archivos'])->orderBy('fecha', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'viaje_id' => 'required|exists:viajes,id',
            'tipo' => 'required|string|in:REMITO,CARTA_DE_PORTE,HOJA_DE_RUTA',
            'numero' => 'required|string',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|in:pendiente,conforme,rechazado',
            'notas' => 'nullable|string',
        ]);

        $documento = Documento::create($validated);

        if ($request->hasFile('archivos')) {
            $this->storeArchivos($request->file('archivos'), $documento);
        }

        return response()->json($documento->load(['viaje', 'archivos']), 201);
    }

    public function show($id)
    {
        $documento = Documento::withTrashed()->with(['viaje', 'archivos'])->findOrFail($id);
        return response()->json($documento);
    }

    public function update(Request $request, $id)
    {
        $documento = Documento::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|in:REMITO,CARTA_DE_PORTE,HOJA_DE_RUTA',
            'numero' => 'sometimes|required|string',
            'fecha' => 'sometimes|required|date',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|in:pendiente,conforme,rechazado',
            'notas' => 'nullable|string',
        ]);

        $documento->update($validated);

        if ($request->hasFile('archivos')) {
            $this->storeArchivos($request->file('archivos'), $documento);
        }

        return response()->json($documento->load(['viaje', 'archivos']));
    }

    public function destroy($id)
    {
        $documento = Documento::findOrFail($id);
        $documento->delete();
        return response()->json(['message' => 'Documento archivado']);
    }

    public function restore($id)
    {
        $documento = Documento::withTrashed()->findOrFail($id);
        $documento->restore();
        return response()->json(['message' => 'Documento restaurado']);
    }

    public function storeArchivo(Request $request, $documentoId)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $documento = Documento::findOrFail($documentoId);

        if ($request->hasFile('archivo')) {
            $this->storeArchivos([$request->file('archivo')], $documento);
        }

        return response()->json($documento->load('archivos'), 201);
    }

    public function destroyArchivo($documentoId, $archivoId)
    {
        $archivo = DocumentoArchivo::where('documento_id', $documentoId)->findOrFail($archivoId);

        Storage::disk('public')->delete($archivo->archivo_path);
        $archivo->delete();

        $documento = Documento::with('archivos')->findOrFail($documentoId);
        return response()->json($documento);
    }

    private function storeArchivos(array $files, Documento $documento): void
    {
        foreach ($files as $file) {
            if ($file->isValid()) {
                $path = $file->store('documentos', 'public');

                DocumentoArchivo::create([
                    'documento_id' => $documento->id,
                    'archivo_path' => $path,
                    'archivo_nombre' => $file->getClientOriginalName(),
                    'archivo_mime' => $file->getMimeType(),
                    'archivo_size' => $file->getSize(),
                ]);
            }
        }
    }
}
