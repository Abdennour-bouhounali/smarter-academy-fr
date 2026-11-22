<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * La librairie fermée n'existe pas (config/books.php) : 404, avant même
 * l'authentification — une route fermée ne dit pas qu'elle demande un compte.
 */
class EnsureBooksEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('books.enabled')) {
            return response()->json(['message' => 'not_found', 'reason' => 'not_found'], 404);
        }

        return $next($request);
    }
}
