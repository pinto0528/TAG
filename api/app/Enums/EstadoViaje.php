<?php

namespace App\Enums;

enum EstadoViaje: string
{
    case PENDIENTE = 'pendiente';
    case EN_CURSO = 'en_curso';
    case FINALIZADO = 'finalizado';
    case CANCELADO = 'cancelado';
}
