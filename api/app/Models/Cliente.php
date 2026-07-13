<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

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

    public function liquidaciones(): HasMany
    {
        return $this->hasMany(Liquidacion::class);
    }
}
