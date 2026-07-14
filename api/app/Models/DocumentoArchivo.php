<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoArchivo extends Model
{
    protected $table = 'documento_archivos';

    protected $fillable = [
        'documento_id',
        'archivo_path',
        'archivo_nombre',
        'archivo_mime',
        'archivo_size',
    ];

    public function documento(): BelongsTo
    {
        return $this->belongsTo(Documento::class);
    }
}
