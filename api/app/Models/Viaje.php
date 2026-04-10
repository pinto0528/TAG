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
        $tipo = $this->fletero_id !== null ? 'T' : 'P';
        $fecha = $this->fecha_salida ? $this->fecha_salida->format('dmy') : 'SD';
        return "{$tipo}-{$fecha}-{$this->id}";
    }

    protected $fillable = [
        'unidad_id',
        'chofer_id',
        'proveedor_id',
        'fletero_id',
        'estado',
        'origen',
        'destino',
        'fecha_salida',
        'hora_salida',
        'fecha_llegada',
        'hora_llegada',
        'precio',
        'km_recorrido',
        'observaciones',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoViaje::class,
            'fecha_salida' => 'date',
            'hora_salida' => 'datetime',
            'fecha_llegada' => 'date',
            'hora_llegada' => 'datetime',
            'precio' => 'decimal:2',
            'km_recorrido' => 'integer',
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

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function fletero(): BelongsTo
    {
        return $this->belongsTo(Fletero::class);
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
