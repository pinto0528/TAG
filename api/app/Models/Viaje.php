<?php

namespace App\Models;

use App\Enums\EstadoViaje;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Illuminate\Database\Eloquent\SoftDeletes;

class Viaje extends Model
{
    use SoftDeletes;

    protected $table = 'viajes';

    protected $appends = ['codigo_viaje'];

    public function getCodigoViajeAttribute()
    {
        $tipo = $this->proveedor_id !== null ? 'T' : 'P';
        return $tipo . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    protected $fillable = [
        'unidad_id',
        'chofer_id',
        'cliente_id',
        'proveedor_id',
        'estado',
        'origen',
        'destino',
        'fecha_salida',
        'hora_salida',
        'fecha_llegada',
        'hora_llegada',
        'precio_pactado',
        'costo_proveedor',
        'km_recorrido',
        'tipo_tarifa',
        'tarifa_valor',
        'tarifa_base',
        'observaciones',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoViaje::class,
            'fecha_salida' => 'date',
            'fecha_llegada' => 'date',
            'precio_pactado' => 'decimal:2',
            'costo_proveedor' => 'decimal:2',
            'km_recorrido' => 'integer',
            'tarifa_valor' => 'decimal:2',
            'tarifa_base' => 'decimal:2',
        ];
    }

    // ---------- Relaciones ----------

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    public function chofer(): BelongsTo
    {
        return $this->belongsTo(Chofer::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function carga(): HasOne
    {
        return $this->hasOne(Carga::class);
    }

    public function anticipos(): HasMany
    {
        return $this->hasMany(Anticipo::class);
    }

    public function gastos(): HasMany
    {
        return $this->hasMany(Gasto::class);
    }

    public function remitos(): HasMany
    {
        return $this->hasMany(Remito::class);
    }

    // ---------- Auditoría ----------

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
