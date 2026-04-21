<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proveedor extends Model
{
    protected $table = 'proveedores';

    protected $fillable = [
        'razon_social',
        'cuit',
        'direccion',
        'telefono',
        'email',
        'contacto',
        'notas',
    ];

    public function unidades(): HasMany
    {
        return $this->hasMany(Unidad::class);
    }

    public function choferes(): HasMany
    {
        return $this->hasMany(Chofer::class);
    }

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }
}
