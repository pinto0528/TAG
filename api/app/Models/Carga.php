<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Carga extends Model
{
    use SoftDeletes;

    protected $table = 'cargas';

    protected $fillable = [
        'viaje_id',
        'descripcion',
        'tipo_carga',
        'peso_kg',
        'cantidad_bultos',
        'requiere_refrigeracion',
    ];

    protected function casts(): array
    {
        return [
            'peso_kg' => 'decimal:2',
            'cantidad_bultos' => 'integer',
            'requiere_refrigeracion' => 'boolean',
        ];
    }

    public function viaje(): BelongsTo
    {
        return $this->belongsTo(Viaje::class);
    }
}
