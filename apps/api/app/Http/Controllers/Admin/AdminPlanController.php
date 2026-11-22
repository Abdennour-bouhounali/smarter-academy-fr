<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanAdminService;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanVersion;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * La configuration des OFFRES — le modèle commercial, sans déploiement.
 * Aucun prix n'est un tarif de fournisseur : tout est informatif, en dinars.
 */
class AdminPlanController extends Controller
{
    public function __construct(private PlanAdminService $plans) {}

    public function index(Request $request)
    {
        $rows = $this->plans->list($request->query());

        return response()->json([
            'success' => true,
            'plans' => $rows->through(fn (Plan $p) => PlanAdminService::serializePlan($p)),
        ]);
    }

    /** Le vocabulaire des clés, pour que l'éditeur se dessine sans rien coder en dur. */
    public function keys()
    {
        return response()->json([
            'success' => true,
            'keys' => collect(EntitlementKeys::all())->map(fn ($meta, $key) => ['key' => $key] + $meta)->values(),
        ]);
    }

    public function show(int $id)
    {
        try {
            $plan = $this->plans->find($id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'plan' => PlanAdminService::serializePlan($plan, withVersions: true),
            'subscribers' => $this->plans->subscribers($plan),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9-]+$/'],
            'description' => 'nullable|string|max:1000',
            'type' => ['required', Rule::in(Plan::TYPES)],
            'displayOrder' => 'nullable|integer|min:0|max:1000',
            'isPublic' => 'nullable|boolean',
            'isDefault' => 'nullable|boolean',
            'allowsRequests' => 'nullable|boolean',
            'entitlements' => 'nullable|array',
            'price' => 'nullable|array',
            'pricingTiers' => 'nullable|array|max:50',
            'pricingTiers.*' => 'array',
        ]);

        try {
            $plan = $this->plans->create($request->user(), $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'plan' => PlanAdminService::serializePlan($plan, withVersions: true)], 201);
    }

    public function update(Request $request, int $id)
    {
        $plan = $this->planOr404($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'description' => 'sometimes|nullable|string|max:1000',
            'displayOrder' => 'sometimes|integer|min:0|max:1000',
            'isPublic' => 'sometimes|boolean',
            'isDefault' => 'sometimes|boolean',
            'allowsRequests' => 'sometimes|boolean',
        ]);

        try {
            $plan = $this->plans->update($request->user(), $plan, $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'plan' => PlanAdminService::serializePlan($plan, withVersions: true)]);
    }

    public function changeStatus(Request $request, int $id)
    {
        $plan = $this->planOr404($id);

        $validated = $request->validate(['status' => ['required', Rule::in(Plan::STATUSES)]]);

        try {
            $plan = $this->plans->changeStatus($request->user(), $plan, $validated['status']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'plan' => PlanAdminService::serializePlan($plan)]);
    }

    public function duplicate(Request $request, int $id)
    {
        $plan = $this->planOr404($id);
        $validated = $request->validate(['name' => 'nullable|string|max:120']);

        $copy = $this->plans->duplicate($request->user(), $plan, $validated['name'] ?? null);

        return response()->json(['success' => true, 'plan' => PlanAdminService::serializePlan($copy, withVersions: true)], 201);
    }

    public function storeVersion(Request $request, int $id)
    {
        $plan = $this->planOr404($id);
        $validated = $request->validate(['notes' => 'nullable|string|max:1000']);

        try {
            $version = $this->plans->createVersion($request->user(), $plan, $validated['notes'] ?? null);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'version' => PlanAdminService::serializeVersion($version)], 201);
    }

    public function updateVersion(Request $request, int $id)
    {
        $version = PlanVersion::find($id);
        if ($version === null) {
            abort(404);
        }

        $validated = $request->validate([
            'entitlements' => 'nullable|array',
            'price' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            // La grille par élève, remplacée d'un bloc (validée côté service).
            'pricingTiers' => 'nullable|array|max:50',
            'pricingTiers.*' => 'array',
        ]);

        try {
            $version = $this->plans->updateVersion($request->user(), $version, $validated['entitlements'] ?? null, $validated['price'] ?? null, $validated['notes'] ?? null, $validated['pricingTiers'] ?? null);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'version' => PlanAdminService::serializeVersion($version)]);
    }

    /** La grille de prix par élève d'une version. */
    public function pricing(int $id)
    {
        $version = PlanVersion::with('pricingTiers')->find($id);
        if ($version === null) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'seatBased' => $version->isSeatBased(),
            'pricingTiers' => PlanAdminService::serializeVersion($version)['pricingTiers'],
        ]);
    }

    /** Remplacer la grille d'une version en brouillon. Chevauchements, trous, bornes inversées → 422. */
    public function replacePricing(Request $request, int $id)
    {
        $version = PlanVersion::find($id);
        if ($version === null) {
            abort(404);
        }

        $validated = $request->validate([
            'pricingTiers' => 'present|array|max:50',
            'pricingTiers.*' => 'array',
        ]);

        try {
            $version = $this->plans->replacePricingTiers($request->user(), $version, $validated['pricingTiers']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'version' => PlanAdminService::serializeVersion($version)]);
    }

    /**
     * L'APERÇU : « pour N élèves, quel palier, quel prix ? » — par le même
     * calcul que la demande et l'activation, sur n'importe quelle version
     * (brouillon compris, pour vérifier avant de publier).
     */
    public function quote(Request $request, int $id)
    {
        $version = PlanVersion::with('pricingTiers')->find($id);
        if ($version === null) {
            abort(404);
        }

        $validated = $request->validate(['seats' => 'required|integer|min:1|max:100000']);

        try {
            $quote = $this->plans->quote($version, (int) $validated['seats']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'quote' => $quote]);
    }

    public function publishVersion(Request $request, int $id)
    {
        $version = PlanVersion::find($id);
        if ($version === null) {
            abort(404);
        }

        try {
            $version = $this->plans->publishVersion($request->user(), $version);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'version' => PlanAdminService::serializeVersion($version)]);
    }

    public function subscriptions(int $id)
    {
        $plan = $this->planOr404($id);

        return response()->json(['success' => true, 'subscriptions' => $this->plans->subscribers($plan)]);
    }

    private function planOr404(int $id): Plan
    {
        $plan = Plan::find($id);
        if ($plan === null) {
            abort(404);
        }

        return $plan;
    }
}
