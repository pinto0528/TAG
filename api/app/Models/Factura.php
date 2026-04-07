<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Factura extends Model
{
    protected $table = 'facturas';

    protected $fillable = [
        'numero',
        'tipo',
        'punto_venta',
        'fecha_emision',
        'fecha_vencimiento',
        'monto_neto',
        'iva',
        'monto_total',
        'estado',
        'notas',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'fecha_vencimiento' => 'date',
            'monto_neto' => 'decimal:2',
            'iva' => 'decimal:2',
            'monto_total' => 'decimal:2',
        ];
    }

    public function remitos(): HasMany
    {
        return $this->hasMany(Remito::class);
    }

    public function ordenPago(): HasOne
    {
        return $this->hasOne(OrdenPago::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
