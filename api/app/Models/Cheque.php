<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cheque extends Model
{
    use SoftDeletes;

    protected $table = 'cheques';

    protected $fillable = [
        'orden_pago_id',
        'numero',
        'banco',
        'monto',
        'fecha_emision',
        'fecha_cobro',
        'beneficiario',
        'estado',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_emision' => 'date',
            'fecha_cobro' => 'date',
        ];
    }

    public function orden_pago(): BelongsTo
    {
        return $this->belongsTo(OrdenPago::class);
    }
}
