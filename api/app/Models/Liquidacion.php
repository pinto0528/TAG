<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Liquidacion extends Model
{
    use SoftDeletes;

    protected $table = 'liquidaciones';

    protected $fillable = [
        'numero',
        'tipo',
        'cliente_id',
        'proveedor_id',
        'fecha_emision',
        'total',
        'estado',
        'notas',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'total' => 'decimal:2',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function viajes(): BelongsToMany
    {
        return $this->belongsToMany(Viaje::class, 'liquidacion_viaje', 'liquidacion_id', 'viaje_id')
            ->withPivot('monto')
            ->withTimestamps();
    }

    public function factura(): HasOne
    {
        return $this->hasOne(Factura::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
