<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\AccountStatusService;
use App\Domain\Admin\ActivityLogger;
use App\Domain\Admin\AmbassadorService;
use App\Domain\Admin\TeacherService;
use App\Domain\Plans\PlanAdminService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Http\Controllers\Controller;
use App\Models\User;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * Les enseignants, côté administration : fiche de contrôle, statut de
 * compte, dérogations d'offre. L'activation d'offre et les codes vivent dans
 * AdminManualSubscriptionController (partagé avec les élèves).
 */
class AdminTeacherController extends Controller
{
    public function __construct(
        private TeacherService $teachers,
        private AccountStatusService $accounts,
        private PlanAdminService $plans,
        private PlanEntitlementResolver $resolver,
        private AmbassadorService $ambassadors,
    ) {}

    public function index(Request $request)
    {
        $rows = $this->teachers->list($request->query());

        return response()->json([
            'success' => true,
            'teachers' => $rows->through(fn (User $t) => $this->teachers->serializeRow($t)),
            'counts' => [
                'all' => User::where('role', User::ROLE_TEACHER)->count(),
                'active' => User::where('role', User::ROLE_TEACHER)->where('account_status', User::STATUS_ACTIVE)->count(),
                'suspended' => User::where('role', User::ROLE_TEACHER)->where('account_status', User::STATUS_SUSPENDED)->count(),
                'disabled' => User::where('role', User::ROLE_TEACHER)->where('account_status', User::STATUS_DISABLED)->count(),
                'ambassadors' => User::where('role', User::ROLE_TEACHER)->where('is_ambassador', true)->count(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $teacher = $this->teachers->find($id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json(['success' => true, ...$this->teachers->detail($teacher)]);
    }

    public function changeStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(User::ACCOUNT_STATUSES)],
        ], ['status.in' => 'Statut de compte inconnu.']);

        try {
            $teacher = $this->accounts->change($request->user(), $this->teachers->find($id), $validated['status'], ActivityLogger::TEACHER_STATUS, 'teacher');
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'teacher' => $this->teachers->serializeRow($teacher)]);
    }

    /**
     * Désigner ou retirer un ambassadeur (« سفير ») — un interrupteur.
     */
    public function setAmbassador(Request $request, int $id)
    {
        $validated = $request->validate(['ambassador' => 'required|boolean']);

        try {
            $teacher = $this->ambassadors->set($request->user(), $this->teachers->find($id), (bool) $validated['ambassador']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'teacher' => $this->teachers->serializeRow($teacher)]);
    }

    public function entitlements(int $id)
    {
        try {
            $teacher = $this->teachers->find($id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'entitlements' => $this->resolver->summaryFor($teacher),
            'entitlementsDetail' => $this->resolver->explain($teacher),
            'overrides' => $this->plans->overridesOf($teacher),
        ]);
    }

    public function grantOverride(Request $request, int $id)
    {
        try {
            $teacher = $this->teachers->find($id);
        } catch (DomainException) {
            abort(404);
        }

        $validated = $request->validate([
            'key' => 'required|string|max:64',
            'value' => 'present',
            'reason' => 'nullable|string|max:255',
            'endsAt' => 'nullable|date',
        ]);

        try {
            $override = $this->plans->grantOverride(
                $request->user(), $teacher, $validated['key'], $validated['value'],
                $validated['reason'] ?? null,
                isset($validated['endsAt']) ? Carbon::parse($validated['endsAt']) : null,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'overrideId' => $override->id,
            'entitlements' => $this->resolver->summaryFor($teacher),
            'entitlementsDetail' => $this->resolver->explain($teacher),
            'overrides' => $this->plans->overridesOf($teacher),
        ], 201);
    }

    public function revokeOverride(Request $request, int $id, int $overrideId)
    {
        try {
            $teacher = $this->teachers->find($id);
        } catch (DomainException) {
            abort(404);
        }

        $validated = $request->validate(['reason' => 'nullable|string|max:255']);

        try {
            $this->plans->revokeOverride($request->user(), $teacher, $overrideId, $validated['reason'] ?? null);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'entitlements' => $this->resolver->summaryFor($teacher),
            'entitlementsDetail' => $this->resolver->explain($teacher),
            'overrides' => $this->plans->overridesOf($teacher),
        ]);
    }
}
