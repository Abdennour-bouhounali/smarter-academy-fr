<?php

namespace App\Http\Controllers;

use App\Domain\Access\EntitlementService;
use App\Domain\Classroom\ClassroomException;
use App\Domain\Classroom\ClassroomInterventionService;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Domain\Classroom\StudyContextService;
use App\Models\Classroom;
use DomainException;
use Illuminate\Http\Request;

/**
 * L'élève et sa classe : « où j'étudie », rejoindre (code ou lien de
 * classe), quitter. L'élève est toujours `$request->user()` ; rejoindre ne
 * prend qu'un code ou le jeton du lien, jamais un identifiant de classe.
 */
class StudentClassroomController extends Controller
{
    public function __construct(
        private StudyContextService $context,
        private ClassroomMembershipService $memberships,
        private EntitlementService $access,
        private ClassroomInterventionService $interventions,
    ) {}

    /**
     * GET /student/teacher-recommendations — ce que les enseignants de
     * l'élève lui suggèrent (réviser un prérequis, une leçon, un exercice).
     * Une suggestion, jamais un verrou ; jamais la note privée.
     */
    public function recommendations(Request $request)
    {
        return response()->json(['success' => true, 'recommendations' => $this->interventions->recommendationsFor($request->user())]);
    }

    public function context(Request $request)
    {
        return response()->json(['success' => true, 'studyContext' => $this->context->resolve($request->user())]);
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:16',
            // Le jeton du lien de classe (/rejoindre/classe/{jeton}).
            'link' => 'nullable|string|max:64',
            // Le geste explicite « أوافق وأنضمّ » : sans lui, on ne rejoint pas.
            'consent' => 'nullable|boolean',
        ]);

        if (empty($validated['code']) && empty($validated['link'])) {
            return response()->json(['success' => false, 'reason' => ClassroomException::INVALID, 'message' => 'Code ou lien de classe manquant.'], 422);
        }

        $consented = (bool) ($validated['consent'] ?? false);
        $alreadyMember = false;

        try {
            if (! empty($validated['link'])) {
                // Idempotent : un membre qui rouvre le lien est renvoyé à sa
                // classe, sans seconde ligne et sans erreur.
                ['membership' => $membership, 'alreadyMember' => $alreadyMember] = $this->memberships->joinByLink($request->user(), $validated['link'], $consented);
            } else {
                $membership = $this->memberships->joinByCode($request->user(), $validated['code'], $consented);
            }
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'reason' => $e instanceof ClassroomException ? $e->reason : null,
                'message' => $e->getMessage(),
            ], 422);
        }

        $this->context->forget($request->user());

        return response()->json([
            'success' => true,
            'classroomId' => $membership->classroom_id,
            'alreadyMember' => $alreadyMember,
            'studyContext' => $this->context->resolve($request->user()),
            'access' => $this->access->summarize($request->user()),
        ], $alreadyMember ? 200 : 201);
    }

    /** POST /student/classrooms/{id}/consent — confirmer le texte de partage actuel. */
    public function consent(Request $request, int $id)
    {
        $classroom = Classroom::find($id);
        if ($classroom === null) {
            abort(404);
        }

        try {
            $this->memberships->confirmConsent($request->user(), $classroom);
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'reason' => $e instanceof ClassroomException ? $e->reason : null,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json(['success' => true, 'studyContext' => $this->context->resolve($request->user())]);
    }

    /**
     * POST /student/classrooms/{id}/school-consent — l'élève accepte que
     * l'ÉTABLISSEMENT de sa classe lise son apprentissage (SCHOOL_ADMIN_SPACE.md §4).
     */
    public function schoolConsent(Request $request, int $id)
    {
        $classroom = Classroom::find($id);
        if ($classroom === null) {
            abort(404);
        }

        try {
            $this->memberships->confirmSchoolConsent($request->user(), $classroom);
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'reason' => $e instanceof ClassroomException ? $e->reason : null,
                'message' => $e->getMessage(),
            ], 422);
        }

        $this->context->forget($request->user());

        return response()->json(['success' => true, 'studyContext' => $this->context->resolve($request->user())]);
    }

    public function leave(Request $request, int $id)
    {
        $classroom = Classroom::find($id);
        if ($classroom === null) {
            abort(404);
        }

        try {
            $this->memberships->leave($request->user(), $classroom);
        } catch (DomainException $e) {
            return response()->json([
                'success' => false,
                'reason' => $e instanceof ClassroomException ? $e->reason : null,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'studyContext' => $this->context->resolve($request->user()),
            'access' => $this->access->summarize($request->user()),
        ]);
    }
}
