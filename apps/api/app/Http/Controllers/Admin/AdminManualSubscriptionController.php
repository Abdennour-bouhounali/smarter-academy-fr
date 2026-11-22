<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ActivationCodeAdminService;
use App\Domain\Admin\TeacherService;
use App\Domain\Classroom\TeacherCapacityService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Plans\SubscriptionActivationService;
use App\Domain\Plans\SubscriptionRequestService;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * L'ACTIVATION MANUELLE des offres — le seul geste commercial du produit
 * algérien, et il appartient à l'administration.
 *
 * Partagé entre enseignants et élèves ({role} dans l'URL ne sert qu'à
 * choisir la fiche ; le compte est vérifié). Aucun paiement : l'argent a
 * été reçu hors plateforme, l'administrateur active, ou envoie un code.
 */
class AdminManualSubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionActivationService $subscriptions,
        private SubscriptionRequestService $requests,
        private ActivationCodeAdminService $codes,
        private PlanEntitlementResolver $resolver,
        private TeacherCapacityService $capacity,
    ) {}

    /** L'état commercial d'un compte : offre effective, abonnements, demandes, codes envoyés. */
    public function show(string $role, int $id)
    {
        $user = $this->accountOr404($role, $id);

        return response()->json([
            'success' => true,
            'entitlements' => $this->resolver->summaryFor($user),
            // La capacité en sièges : combien il peut encadrer, combien il encadre.
            'capacity' => $user->isTeacher() ? $this->capacity->summary($user) : null,
            'subscriptions' => $this->subscriptions->history($user),
            'requests' => SubscriptionRequest::where('user_id', $user->id)->orderByDesc('id')->get()
                ->map(fn ($r) => SubscriptionRequestService::serialize($r))->values(),
            'issuedCodes' => TeacherService::issuedCodes($user),
        ]);
    }

    /** Activer une offre sur le compte — après règlement hors plateforme. */
    public function activate(Request $request, string $role, int $id)
    {
        $user = $this->accountOr404($role, $id);

        $validated = $request->validate([
            'planId' => 'required|integer|min:1',
            'planVersionId' => 'nullable|integer|min:1',
            'endsAt' => 'nullable|date',
            'note' => 'nullable|string|max:255',
            // Le NOMBRE d'élèves ; jamais un prix — le serveur le calcule.
            'studentSeats' => 'nullable|integer|min:1|max:100000',
        ]);

        $plan = Plan::find($validated['planId']);
        if ($plan === null) {
            abort(404);
        }
        $version = isset($validated['planVersionId']) ? PlanVersion::find($validated['planVersionId']) : null;

        try {
            $subscription = $this->subscriptions->activate(
                $request->user(), $user, $plan, $version,
                isset($validated['endsAt']) ? Carbon::parse($validated['endsAt']) : null,
                $validated['note'] ?? null,
                isset($validated['studentSeats']) ? (int) $validated['studentSeats'] : null,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'subscription' => SubscriptionActivationService::serialize($subscription),
            'entitlements' => $this->resolver->summaryFor($user),
        ], 201);
    }

    /** Envoyer UN code d'activation, unique, lié à l'offre, à l'adresse du compte. */
    public function issueCode(Request $request, string $role, int $id)
    {
        $user = $this->accountOr404($role, $id);

        $validated = $request->validate([
            'planId' => 'required|integer|min:1',
            'planVersionId' => 'nullable|integer|min:1',
            'redeemBy' => 'nullable|date',
            'accessDays' => 'nullable|integer|min:1|max:3650',
            'accessEndsAt' => 'nullable|date',
            'studentSeats' => 'nullable|integer|min:1|max:100000',
        ]);

        $plan = Plan::find($validated['planId']);
        if ($plan === null) {
            abort(404);
        }
        $version = isset($validated['planVersionId']) ? PlanVersion::find($validated['planVersionId']) : null;

        try {
            $result = $this->codes->issueIndividualCode(
                $request->user(), $user, $plan, $version,
                isset($validated['redeemBy']) ? Carbon::parse($validated['redeemBy']) : null,
                $validated['accessDays'] ?? null,
                isset($validated['accessEndsAt']) ? Carbon::parse($validated['accessEndsAt']) : null,
                isset($validated['studentSeats']) ? (int) $validated['studentSeats'] : null,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'batch' => $this->codes->serializeBatch($result['batch']),
            'code' => $result['code'],
            'codesShownOnce' => true,
            'sentTo' => $user->email,
        ], 201);
    }

    public function requests(Request $request)
    {
        $query = SubscriptionRequest::with(['user:id,first_name,last_name,email,role', 'plan:id,slug,name,type', 'planVersion:id,version', 'reviewedBy:id,first_name,last_name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($type = $request->query('type')) {
            $query->whereHas('plan', fn ($q) => $q->where('type', $type));
        }

        $rows = $query->orderByRaw("CASE status WHEN 'pending' THEN 0 ELSE 1 END")->orderByDesc('id')
            ->paginate(min((int) $request->query('perPage', 25), 100));

        return response()->json([
            'success' => true,
            'requests' => $rows->through(fn ($r) => SubscriptionRequestService::serialize($r)),
            'counts' => [
                'pending' => SubscriptionRequest::where('status', SubscriptionRequest::STATUS_PENDING)->count(),
                'all' => SubscriptionRequest::count(),
            ],
        ]);
    }

    public function rejectRequest(Request $request, int $requestId)
    {
        $subscriptionRequest = SubscriptionRequest::find($requestId);
        if ($subscriptionRequest === null) {
            abort(404);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'note' => 'nullable|string|max:255',
        ], ['reason.required' => 'Indiquez le motif du refus.']);

        try {
            $this->requests->reject($request->user(), $subscriptionRequest, $validated['reason'], $validated['note'] ?? null);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'request' => SubscriptionRequestService::serialize($subscriptionRequest)]);
    }

    public function suspend(Request $request, int $subscriptionId)
    {
        return $this->lifecycle($request, $subscriptionId, fn (Subscription $s, ?string $reason) => $this->subscriptions->suspend($request->user(), $s, $reason));
    }

    public function resume(Request $request, int $subscriptionId)
    {
        return $this->lifecycle($request, $subscriptionId, fn (Subscription $s, ?string $reason) => $this->subscriptions->resume($request->user(), $s, $reason));
    }

    public function cancel(Request $request, int $subscriptionId)
    {
        return $this->lifecycle($request, $subscriptionId, fn (Subscription $s, ?string $reason) => $this->subscriptions->cancel($request->user(), $s, $reason));
    }

    public function extend(Request $request, int $subscriptionId)
    {
        $validated = $request->validate(['endsAt' => 'nullable|date']);
        $endsAt = isset($validated['endsAt']) ? Carbon::parse($validated['endsAt']) : null;

        return $this->lifecycle($request, $subscriptionId, fn (Subscription $s, ?string $reason) => $this->subscriptions->extend($request->user(), $s, $endsAt, $reason));
    }

    public function changePlan(Request $request, int $subscriptionId)
    {
        $validated = $request->validate([
            'planId' => 'required|integer|min:1',
            'planVersionId' => 'nullable|integer|min:1',
            'endsAt' => 'nullable|date',
            'note' => 'nullable|string|max:255',
            'studentSeats' => 'nullable|integer|min:1|max:100000',
        ]);
        $plan = Plan::find($validated['planId']);
        if ($plan === null) {
            abort(404);
        }
        $version = isset($validated['planVersionId']) ? PlanVersion::find($validated['planVersionId']) : null;
        $endsAt = isset($validated['endsAt']) ? Carbon::parse($validated['endsAt']) : null;
        $seats = isset($validated['studentSeats']) ? (int) $validated['studentSeats'] : null;

        return $this->lifecycle($request, $subscriptionId, fn (Subscription $s) => $this->subscriptions->changePlan($request->user(), $s, $plan, $version, $endsAt, $validated['note'] ?? null, $seats));
    }

    private function lifecycle(Request $request, int $subscriptionId, callable $apply)
    {
        $subscription = Subscription::find($subscriptionId);
        if ($subscription === null) {
            abort(404);
        }
        $reason = $request->validate(['reason' => 'nullable|string|max:255'])['reason'] ?? null;

        try {
            $result = $apply($subscription, $reason);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'subscription' => SubscriptionActivationService::serialize($result),
            'entitlements' => $this->resolver->summaryFor($result->user),
        ]);
    }

    private function accountOr404(string $role, int $id): User
    {
        $expected = $role === 'teachers' ? User::ROLE_TEACHER : User::ROLE_STUDENT;
        $user = User::where('role', $expected)->find($id);
        if ($user === null) {
            abort(404);
        }

        return $user;
    }
}
