<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\RegistryHealthService;
use App\Http\Controllers\Controller;

/**
 * Le diagnostic de cohérence — réservé à l'administration.
 *
 * Ces informations (orphelins, identifiants internes, états de publication)
 * ne doivent jamais atteindre un élève : elles décrivent la mécanique, pas
 * l'apprentissage. La route vit donc dans le groupe can:admin.
 */
class AdminHealthController extends Controller
{
    public function __construct(private RegistryHealthService $health) {}

    public function index()
    {
        return response()->json([
            'success' => true,
            'health' => $this->health->report(),
        ]);
    }
}
