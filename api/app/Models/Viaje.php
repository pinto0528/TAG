<?php

namespace App\Models;

use App\Enums\EstadoViaje;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Viaje extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (Viaje $viaje) {
            if (is_null($viaje->nro_viaje)) {
                $viaje->nro_viaje = (self::max('nro_viaje') ?? 0) + 1;
            }
        });
    }

    protected $table = 'viajes';

    protected $appends = ['codigo_viaje'];

    public function getCodigoViajeAttribute()
    {
        $tipo = $this->proveedor_id !== null ? 'T' : 'P';
        return $tipo . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    protected $fillable = [
        'nro_viaje',
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
        'costo_viaje',
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
            'costo_viaje' => 'decimal:2',
            'km_recorrido' => 'integer',
            'tarifa_valor' => 'decimal:2',
            'tarifa_base' => 'decimal:2',
        ];
    }

    // ---------- Relaciones ----------

    public function unidades(): BelongsToMany
    {
        return $this->belongsToMany(Unidad::class, 'viaje_unidad');
    }

    // Accesor retrocompatible: primera unidad del viaje
    public function getUnidadAttribute()
    {
        return $this->unidades->first();
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

    public function documento(): HasOne
    {
        return $this->hasOne(Documento::class);
    }

    public function liquidaciones(): BelongsToMany
    {
        return $this->belongsToMany(Liquidacion::class, 'liquidacion_viaje', 'viaje_id', 'liquidacion_id')
            ->withPivot('monto')
            ->withTimestamps();
    }

    // ---------- Costo ----------

    public function recalcularCostoViaje(): void
    {
        $gastos = $this->gastos()->withoutTrashed()->get();
        $anticipos = $this->anticipos()->withoutTrashed()->sum('monto');

        $propioReintegro = $gastos->where('clase', 'propio')->where('reintegro', true)->sum('monto');
        $terceroReintegro = $gastos->where('clase', 'tercerizado')->where('reintegro', true)->sum('monto');
        $propioSinReintegro = $gastos->where('clase', 'propio')->where('reintegro', false)->sum('monto');

        $costoProveedorBase = $this->costo_proveedor ?? 0;
        $costoProveedorAjustado = $costoProveedorBase - $anticipos - $propioReintegro + $terceroReintegro;

        $this->costo_viaje = $costoProveedorAjustado + $propioSinReintegro + $terceroReintegro;
        $this->save();
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
