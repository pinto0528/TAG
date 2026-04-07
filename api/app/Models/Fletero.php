<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fletero extends Model
{
    protected $table = 'fleteros';

    protected $fillable = [
        'razon_social',
        'cuit',
        'telefono',
        'email',
        'contacto',
        'notas',
    ];

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }
}
