<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = [
        'razon_social',
        'cuit',
        'direccion',
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
