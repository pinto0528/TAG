<?php

namespace Tests\Feature;

use App\Models\Viaje;
use App\Models\Documento;
use App\Models\Cliente;
use App\Models\Chofer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentoApiTest extends TestCase
{
    use RefreshDatabase;

    private $cliente;
    private $chofer;
    private $viaje;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->cliente = Cliente::create([
            'razon_social' => 'Cliente Test',
            'cuit' => '30-11111111-1',
        ]);

        $this->chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.111.111',
        ]);

        $this->viaje = Viaje::create([
            'chofer_id' => $this->chofer->id,
            'cliente_id' => $this->cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'estado' => 'pendiente',
        ]);
    }

    // ================================================================
    // ARCHIVOS
    // ================================================================

    public function test_store_archivo(): void
    {
        $documento = Documento::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        $archivo = UploadedFile::fake()->create('remito.pdf', 100, 'application/pdf');

        $response = $this->postJson("/api/documentos/{$documento->id}/archivos", [
            'archivo' => $archivo,
        ]);

        $response->assertCreated()
            ->assertJsonCount(1, 'archivos');

        $this->assertDatabaseHas('documento_archivos', [
            'documento_id' => $documento->id,
            'archivo_nombre' => 'remito.pdf',
        ]);
    }

    public function test_store_archivo_tipo_invalido(): void
    {
        $documento = Documento::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        $archivo = UploadedFile::fake()->create('virus.exe', 100, 'application/x-msdownload');

        $response = $this->postJson("/api/documentos/{$documento->id}/archivos", [
            'archivo' => $archivo,
        ]);

        $response->assertStatus(422);
    }

    public function test_destroy_archivo(): void
    {
        $documento = Documento::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        // Simular que ya tiene un archivo
        $archivo = $documento->archivos()->create([
            'archivo_path' => 'documentos/test.jpg',
            'archivo_nombre' => 'test.jpg',
            'archivo_mime' => 'image/jpeg',
            'archivo_size' => 1024,
        ]);

        $response = $this->deleteJson("/api/documentos/{$documento->id}/archivos/{$archivo->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('documento_archivos', [
            'id' => $archivo->id,
        ]);
    }

    // ================================================================
    // CRUD BASICO
    // ================================================================

    public function test_store_crea_documento(): void
    {
        $response = $this->postJson('/api/documentos', [
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['tipo' => 'REMITO']);
    }

    public function test_store_validacion(): void
    {
        $response = $this->postJson('/api/documentos', [
            'viaje_id' => $this->viaje->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_show_retorna_documento(): void
    {
        $documento = Documento::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        $response = $this->getJson("/api/documentos/{$documento->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $documento->id]);
    }

    public function test_destroy_soft_delete(): void
    {
        $documento = Documento::create([
            'viaje_id' => $this->viaje->id,
            'tipo' => 'REMITO',
            'numero' => 'REM-001',
            'fecha' => '2026-07-15',
        ]);

        $response = $this->deleteJson("/api/documentos/{$documento->id}");

        $response->assertOk();
        $this->assertSoftDeleted('documentos', ['id' => $documento->id]);
    }
}
