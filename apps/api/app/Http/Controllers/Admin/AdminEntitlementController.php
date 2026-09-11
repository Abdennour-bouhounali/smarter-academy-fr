<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Access\EntitlementService;
use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Domain\Admin\EntitlementAdminService;
use App\Http\Controllers\Controller;
use App\Models\User;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * L'accès d'un élève, vu de l'administration.
 *
 * Trois gestes seulement : consulter, accorder une dérogation, la retirer.
 * Pas de facturation, pas de paiement, pas d'abonnement créé à la main — voir
 * EntitlementAdminService pour le pourquoi de cette limite.
 *
 * Toute la protection vient des routes : ce contrôleur vit derrière
 * auth:sanctum + account.active + can:admin. Un élève n'atteint donc jamais
 * ces méthodes, et un administrateur suspendu non plus (spec §54).
 */
class AdminEntitlementController extends Controller
{
    public function __construct(
        private EntitlementAdminService $admin,
        private EntitlementService $entitlements,
        private SubscriptionEntitlementSynchronizer $sync,
    ) {}

    /** L'état d'accès d'un élève, et l'historique qui l'explique. */
    public function show(int $id)
    {
        $student = User::find($id);
        if ($student === null) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'access' => $this->entitlements->summarize($student),
            'entitlements' => $this->admin->history($student),
            // Les abonnements qui ALIMENTENT ces droits, pour que
            // l'administrateur voie la chaîne entière — abonnement →
            // synchronisation → droit — sans changer d'écran.
            'subscriptions' => $student->subscriptions()
                ->orderByDesc('started_at')
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'plan' => $s->plan,
                    'status' => $s->status,
                    'startedAt' => optional($s->started_at)->toIso8601String(),
                    'endsAt' => optional($s->ends_at)->toIso8601String(),
                    'provider' => $s->provider,
                    // L'état du fournisseur, pour diagnostiquer un écart entre
                    // ce qu'il raconte et ce que nous appliquons.
                    'providerStatus' => $s->provider_status,
                    'providerReference' => $s->external_reference,
                    'currentPeriodEnd' => optional($s->current_period_end)->toIso8601String(),
                    'cancelAtPeriodEnd' => (bool) $s->cancel_at_period_end,
                    'providerSyncedAt' => optional($s->provider_synced_at)->toIso8601String(),
                ])->all(),
        ]);
    }

    /**
     * Réconcilier les droits d'un élève avec ses abonnements.
     *
     * Ce n'est NI un encaissement, NI une création d'abonnement : le service
     * ne fait que relire l'état existant et en tirer les droits. Un
     * administrateur ne peut donc pas fabriquer un accès payant par ce
     * chemin — sans abonnement, la synchronisation ne produit rien.
     *
     * Existe parce qu'aucun fournisseur de paiement n'est branché : jusque-là,
     * un abonnement modifié hors de l'application n'aurait aucun moyen
     * d'atteindre la couche d'accès.
     */
    public function syncSubscriptions(Request $request, int $id)
    {
        $student = User::find($id);
        if ($student === null) {
            abort(404);
        }

        $results = $this->sync->syncUser($student);

        $this->entitlements->forget($student);

        return response()->json([
            'success' => true,
            'synchronized' => count($results),
            'actions' => array_count_values(array_column($results, 'action')),
            'access' => $this->entitlements->summarize($student),
            'entitlements' => $this->admin->history($student),
        ]);
    }

    public function grant(Request $request, int $id)
    {
        $student = User::find($id);
        if ($student === null) {
            abort(404);
        }

        $validated = $request->validate([
            // Une dérogation SANS terme est possible, mais elle doit être
            // choisie : le champ est nullable, jamais absent par défaut.
            'expiresAt' => 'nullable|date',
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            $entitlement = $this->admin->grantOverride(
                $request->user(),
                $student,
                isset($validated['expiresAt']) ? Carbon::parse($validated['expiresAt']) : null,
                $validated['reason'] ?? null,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        // Le service a mémorisé l'état d'AVANT l'octroi pendant cette requête.
        $this->entitlements->forget($student);

        return response()->json([
            'success' => true,
            'entitlementId' => $entitlement->id,
            'access' => $this->entitlements->summarize($student),
        ], 201);
    }

    public function revoke(Request $request, int $id)
    {
        $student = User::find($id);
        if ($student === null) {
            abort(404);
        }

        $validated = $request->validate(['reason' => 'nullable|string|max:255']);

        try {
            $this->admin->revokeOverride($request->user(), $student, $validated['reason'] ?? null);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $this->entitlements->forget($student);

        return response()->json([
            'success' => true,
            'access' => $this->entitlements->summarize($student),
        ]);
    }
}
