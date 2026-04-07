<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cheque extends Model
{
    protected $table = 'cheques';

    protected $fillable = [
        'orden_pago_id',
        'numero',
        'banco',
        'fecha_emision',
        'fecha_cobro',
        'monto',
        'beneficiario',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'fecha_cobro' => 'date',
            'monto' => 'decimal:2',
        ];
    }

    public function ordenPago(): BelongsTo
    {
        return $this->belongsTo(OrdenPago::class);
    }
}
