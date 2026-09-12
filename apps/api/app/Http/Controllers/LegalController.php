<?php

namespace App\Http\Controllers;

/**
 * Les versions des documents légaux, servies au frontend.
 *
 * Public et en lecture seule : l'inscription doit pouvoir afficher « version
 * du ... » avant que quiconque soit connecté.
 *
 * Ce point d'entrée n'ACCEPTE rien. Il rend ce que le serveur tient pour vrai.
 * C'est la moitié visible de la règle §7 : le frontend AFFICHE les versions,
 * le serveur les ÉCRIT — et jamais l'inverse.
 */
class LegalController extends Controller
{
    public function versions()
    {
        return response()->json([
            'success' => true,
            'versions' => [
                'terms' => config('legal.terms_version'),
                'privacy' => config('legal.privacy_version'),
            ],
        ]);
    }
}
