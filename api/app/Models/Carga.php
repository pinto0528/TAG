<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Carga extends Model
{
    protected $table = 'cargas';

    protected $fillable = [
        'viaje_id',
        'descripcion',
        'tipo_carga',
        'peso_kg',
        'volumen_m3',
        'cantidad_bultos',
        'temperatura_requerida',
        'requiere_refrigeracion',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'peso_kg' => 'decimal:2',
            'volumen_m3' => 'decimal:2',
            'requiere_refrigeracion' => 'boolean',
        ];
    }

    public function viaje(): BelongsTo
    {
        return $this->belongsTo(Viaje::class);
    }
}
