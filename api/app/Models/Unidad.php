<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unidad extends Model
{
    use SoftDeletes;

    protected $table = 'unidades';

    protected $fillable = [
        'proveedor_id',
        'patente',
        'marca',
        'modelo',
        'anio',
        'tipo',
        'numero',
        'vtv_vencimiento',
        'seguro_vencimiento',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'vtv_vencimiento' => 'date',
            'seguro_vencimiento' => 'date',
            'activo' => 'boolean',
        ];
    }

    public function proveedor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function viajes(): BelongsToMany
    {
        return $this->belongsToMany(Viaje::class, 'viaje_unidad');
    }
}
