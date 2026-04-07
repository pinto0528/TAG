<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chofer extends Model
{
    protected $table = 'choferes';

    protected $fillable = [
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

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }
}
