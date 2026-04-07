<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unidad extends Model
{
    protected $table = 'unidades';

    protected $fillable = [
        'patente',
        'marca',
        'modelo',
        'anio',
        'tipo',
        'numero_interno',
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

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }
}
