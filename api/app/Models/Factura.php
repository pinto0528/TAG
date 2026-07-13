<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Factura extends Model
{
    use SoftDeletes;

    protected $table = 'facturas';

    protected $fillable = [
        'liquidacion_id',
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

    public function liquidacion(): BelongsTo
    {
        return $this->belongsTo(Liquidacion::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
