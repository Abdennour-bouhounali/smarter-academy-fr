<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\ClassroomInsightService;
use App\Domain\Classroom\ClassroomInterventionService;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\Classroom\ParentCards;
use App\Domain\Classroom\StudentCredentials;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * Les élèves d'une classe : la liste avec leur progression, le dossier de
 * l'un d'eux, le retrait. L'élève est toujours résolu PAR la classe
 * possédée, et doit en être membre ACTIF (ClassroomAccess) — jamais par un
 * identifiant libre.
 */
class TeacherClassroomStudentController extends Controller
{
    public function __construct(
        private ClassroomProgressService $progress,
        private ClassroomMembershipService $memberships,
        private ClassroomInsightService $insights,
        private ClassroomInterventionService $interventions,
        private StudentCredentials $credentials,
    ) {}

    public function index(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return response()->json(['success' => true, 'students' => $this->progress->rosterFor($classroom)]);
    }

    public function progress(Request $request, int $id, int $studentId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $student = ClassroomAccess::activeStudent($classroom, $studentId);

        try {
            $detail = $this->progress->studentDetail($classroom, $student);
            // L'aperçu (« لمحة ») et les signaux de CET élève — les mêmes que
            // la classe montre à son sujet — et les gestes déjà faits pour lui.
            $insights = $this->insights->forStudent($classroom, $student);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json([
            'success' => true,
            ...$detail,
            ...$insights,
            'interventions' => $this->interventions->forStudent($classroom, $request->user(), $student),
        ]);
    }

    public function destroy(Request $request, int $id, int $studentId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');

        try {
            $this->memberships->remove($request->user(), $classroom, $studentId);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true]);
    }

    /**
     * « بطاقات الدخول » : un NOUVEAU mot de passe pour chaque élève choisi,
     * rendu une seule fois avec son courriel, pour être imprimé
     * (StudentCredentials).
     */
    public function credentials(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $validated = $request->validate([
            'studentIds' => 'required|array|min:1|max:200',
            'studentIds.*' => 'integer',
        ]);

        try {
            $cards = $this->credentials->issue($request->user(), $classroom, $validated['studentIds']);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, 'credentials' => $cards])
            ->header('Cache-Control', 'no-store');
    }

    /** « بطاقات الأولياء » : le QR du « رابط الوليّ » de chaque élève choisi (PARENT_SPACE.md §2bis). */
    public function parentCards(Request $request, int $id, ParentCards $parentCards)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $validated = $request->validate([
            'studentIds' => 'required|array|min:1|max:200',
            'studentIds.*' => 'integer',
        ]);

        try {
            $cards = $parentCards->issue($request->user(), $classroom, $validated['studentIds']);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, 'cards' => $cards])
            ->header('Cache-Control', 'no-store');
    }
}
