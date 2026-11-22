<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Access\Features\FeatureAccessAdminService;
use App\Http\Controllers\Controller;
use App\Models\User;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « الوصول والحدود » : ce que chaque palier peut faire des instruments du
 * مختبر, du cahier et des travaux — et ce qu'il en a consommé.
 *
 * Derrière `can:admin` comme tout /admin. Le service valide et journalise ;
 * ici on ne fait que traduire ses refus en 422.
 */
class AdminAccessPolicyController extends Controller
{
    public function __construct(private FeatureAccessAdminService $admin) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'tiers' => ['free', 'premium'],
            'features' => $this->admin->list(),
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'free' => 'required|array',
            'premium' => 'required|array',
            'period' => 'nullable|string',
        ]);

        try {
            $feature = $this->admin->update($request->user(), $key, $request->only(['enabled', 'free', 'premium', 'period']));
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'feature' => $feature]);
    }

    public function usage(): JsonResponse
    {
        return response()->json(['success' => true, 'usage' => $this->admin->usageReport()]);
    }

    /** La consommation d'un compte élève ou enseignant (fiche du compte). */
    public function userUsage(int $id): JsonResponse
    {
        $user = User::query()->whereIn('role', [User::ROLE_STUDENT, User::ROLE_TEACHER])->find($id);
        if ($user === null) {
            return response()->json(['success' => false, 'message' => 'Compte introuvable.'], 404);
        }

        return response()->json(['success' => true, 'usage' => $this->admin->usageFor($user)]);
    }
}
