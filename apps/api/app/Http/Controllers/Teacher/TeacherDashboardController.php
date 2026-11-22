<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomService;
use App\Domain\Classroom\TeacherCapacityService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\SubscriptionRequest;
use Illuminate\Http\Request;

/**
 * L'accueil de l'espace enseignant : ses classes, son usage, son offre.
 *
 * Derrière auth:sanctum + account.active + email.verified + can:teacher.
 * Aucun identifiant n'est lu dans la requête : tout part de l'enseignant
 * authentifié.
 */
class TeacherDashboardController extends Controller
{
    public function __construct(
        private ClassroomService $classrooms,
        private PlanEntitlementResolver $entitlements,
        private TeacherCapacityService $capacity,
    ) {}

    public function index(Request $request)
    {
        $teacher = $request->user();

        return response()->json([
            'success' => true,
            'dashboard' => [
                'classrooms' => $this->classrooms->listFor($teacher)
                    ->map(fn (Classroom $c) => TeacherClassroomController::serialize($c))
                    ->values(),
                'entitlements' => $this->entitlements->summaryFor($teacher),
                'capacity' => $this->capacity->summary($teacher),
                'pendingRequest' => SubscriptionRequest::where('user_id', $teacher->id)
                    ->where('status', SubscriptionRequest::STATUS_PENDING)->exists(),
            ],
        ]);
    }

    /** Le résumé d'offre seul — pour les jauges de l'interface. */
    public function entitlements(Request $request)
    {
        return response()->json([
            'success' => true,
            'entitlements' => $this->entitlements->summaryFor($request->user()),
            'capacity' => $this->capacity->summary($request->user()),
        ]);
    }

    /**
     * La capacité en sièges : « combien d'élèves puis-je encore accueillir ? »
     * Les classes ne sont pas comptées ici — elles ne sont pas l'unité de vente.
     */
    public function capacity(Request $request)
    {
        return response()->json([
            'success' => true,
            'capacity' => $this->capacity->summary($request->user()),
        ]);
    }
}
