<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chofer extends Model
{
    use SoftDeletes;

    protected $table = 'choferes';

    protected $fillable = [
        'proveedor_id',
        'numero',
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'email',
        'direccion',
        'fecha_nacimiento',
        'licencia_vencimiento',
        'linti_vencimiento',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'licencia_vencimiento' => 'date',
            'linti_vencimiento' => 'date',
            'activo' => 'boolean',
        ];
    }

    public function proveedor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }
}
