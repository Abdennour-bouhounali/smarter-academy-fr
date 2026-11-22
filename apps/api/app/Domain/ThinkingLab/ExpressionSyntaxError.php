<?php

namespace App\Domain\ThinkingLab;

use RuntimeException;

/** Saisie illisible : le message est le code d'erreur partagé avec le JS (`unbalanced`, `unknown_symbol`…). */
final class ExpressionSyntaxError extends RuntimeException {}
