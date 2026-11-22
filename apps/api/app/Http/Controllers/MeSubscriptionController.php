<?php

namespace App\Http\Controllers;

use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanAdminService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Plans\SubscriptionActivationService;
use App\Domain\Plans\SubscriptionRequestException;
use App\Domain\Plans\SubscriptionRequestService;
use App\Domain\Plans\TeacherPricingService;
use App\Models\Plan;
use App\Models\SubscriptionRequest;
use DomainException;
use Illuminate\Http\Request;

/**
 * « Mon offre » — pour un enseignant comme pour un élève.
 *
 * Aucun paiement en ligne : cette surface MONTRE les offres (prix informatif
 * en dinars), ENREGISTRE une demande, et rend l'état. Elle n'active rien :
 * l'activation vient de l'administration (à la main ou par code). Tout part
 * de l'utilisateur authentifié ; aucun identifiant de compte n'est lu.
 */
class MeSubscriptionController extends Controller
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private SubscriptionActivationService $subscriptions,
        private SubscriptionRequestService $requests,
        private TeacherPricingService $pricing,
    ) {}

    /** Les offres PUBLIQUES du type de ce compte. */
    public function plans(Request $request)
    {
        $user = $request->user();
        $type = $user->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
        $current = $this->entitlements->summaryFor($user)['plan'];

        $plans = Plan::ofType($type)->public()
            ->with(['currentVersion.entitlements', 'currentVersion.activePrice', 'currentVersion.pricingTiers'])
            ->orderBy('display_order')->orderBy('id')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'slug' => $plan->slug,
                'name' => $plan->name,
                'description' => $plan->description,
                'isDefault' => $plan->is_default,
                'allowsRequests' => $plan->isRequestable(),
                'isCurrent' => $plan->slug === ($current['slug'] ?? null),
                'currentVersionId' => $plan->currentVersion?->id,
                'entitlements' => $plan->currentVersion?->entitlementMap() ?? [],
                'price' => PlanAdminService::serializePrice($plan->currentVersion?->activePrice),
                // Par sièges : la grille (pour l'aperçu client ; le serveur reste l'autorité).
                'seatBased' => $plan->currentVersion?->isSeatBased() ?? false,
                'pricingTiers' => $plan->currentVersion === null ? [] : $this->pricing->tiersFor($plan->currentVersion)
                    ->map(fn ($t) => TeacherPricingService::serializeTier($t))->values()->all(),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'plans' => $plans,
            // Ce que le gratuit accorde déjà en sièges : sous ce nombre, rien à demander.
            'freeSeats' => $type === Plan::TYPE_TEACHER ? $this->entitlements->defaultValue($type, EntitlementKeys::STUDENTS_TOTAL_MAX) : null,
        ]);
    }

    /** Le devis serveur pour N élèves sur une offre publique — l'autorité que le client confirme. */
    public function quote(Request $request, int $planId)
    {
        $user = $request->user();
        $type = $user->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
        $plan = Plan::ofType($type)->public()->with('currentVersion.pricingTiers')->find($planId);
        if ($plan === null || $plan->currentVersion === null) {
            abort(404);
        }

        $validated = $request->validate(['seats' => 'required|integer|min:1|max:100000']);

        try {
            $quote = $this->pricing->quote($plan->currentVersion, (int) $validated['seats']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => SubscriptionRequestException::SEATS_NOT_COVERED, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'quote' => $quote]);
    }

    /** L'état : offre effective, abonnement en cours, demande en attente, historique. */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'entitlements' => $this->entitlements->summaryFor($user),
            'subscriptions' => $this->subscriptions->history($user),
            'requests' => SubscriptionRequest::where('user_id', $user->id)->orderByDesc('id')->limit(10)->get()
                ->map(fn ($r) => SubscriptionRequestService::serialize($r))->values(),
        ]);
    }

    public function requests(Request $request)
    {
        return response()->json([
            'success' => true,
            'requests' => SubscriptionRequest::where('user_id', $request->user()->id)->orderByDesc('id')->get()
                ->map(fn ($r) => SubscriptionRequestService::serialize($r))->values(),
        ]);
    }

    /** Une DEMANDE — jamais une activation. */
    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'planId' => 'required|integer|min:1',
            'note' => 'nullable|string|max:500',
            // Le NOMBRE d'élèves voulu. Aucun prix n'est lu : le serveur le calcule.
            'studentSeats' => 'nullable|integer|min:1|max:100000',
        ]);

        $plan = Plan::find($validated['planId']);
        if ($plan === null) {
            abort(404);
        }

        try {
            $created = $this->requests->request(
                $request->user(), $plan, $validated['note'] ?? null,
                isset($validated['studentSeats']) ? (int) $validated['studentSeats'] : null,
            );
        } catch (SubscriptionRequestException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], 422);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'request' => SubscriptionRequestService::serialize($created),
            'entitlements' => $this->entitlements->summaryFor($request->user()),
        ], 201);
    }

    public function cancelRequest(Request $request, int $requestId)
    {
        $subscriptionRequest = SubscriptionRequest::where('user_id', $request->user()->id)->whereKey($requestId)->first();
        if ($subscriptionRequest === null) {
            abort(404);
        }

        try {
            $this->requests->cancel($request->user(), $subscriptionRequest);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'request' => SubscriptionRequestService::serialize($subscriptionRequest),
            'entitlements' => $this->entitlements->summaryFor($request->user()),
        ]);
    }
}
