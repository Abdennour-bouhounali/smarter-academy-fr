<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Le TRAJET D'APPRENTISSAGE appartient à l'élève.
 *
 * Progression de leçon, preuves d'apprentissage, tentative du test final :
 * ces écritures fabriquent le dossier d'un ÉLÈVE (student_lesson_progress,
 * la maîtrise, les analyses de classe). Un enseignant ou un administrateur
 * qui lit une leçon — librement, tous les modules ouverts — n'apprend pas :
 * rien de ce qu'il fait ne doit produire une ligne de progression, ni pour
 * lui, ni pour personne. Le refus est net (403, motif `not_a_learner`) ; le
 * client, qui connaît son rôle, n'envoie de toute façon rien.
 */
class EnsureLearnerRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isStudent()) {
            return response()->json([
                'success' => false,
                'reason' => 'not_a_learner',
                'message' => 'Seul un compte élève enregistre une progression d\'apprentissage.',
            ], 403);
        }

        return $next($request);
    }
}
