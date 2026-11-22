<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\ClassroomInterventionService;
use App\Domain\Classroom\ClassroomLearningPointService;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * Classe × learning point, en LECTURE SEULE : la carte (un point par ligne,
 * la distribution des statuts), le détail d'un point élève par élève, et la
 * preuve d'un point pour un élève de la classe. Rien n'est écrit, rien n'est
 * copié : chaque réponse est une requête sur l'état canonique.
 */
class TeacherClassroomLearningPointController extends Controller
{
    public function __construct(
        private ClassroomLearningPointService $points,
        private ClassroomInterventionService $interventions,
    ) {}

    /**
     * GET /teacher/classrooms/{id}/learning-points[?lesson=]
     *
     * Avec `lesson` : les points de cette leçon. Sans : tout le périmètre de
     * la classe, groupé par leçon — la carte d'apprentissage.
     */
    public function index(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $validated = $request->validate(['lesson' => 'nullable|string|max:120']);

        try {
            $map = $this->points->map($classroom, $validated['lesson'] ?? null);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, ...$map]);
    }

    /**
     * GET /teacher/classrooms/{id}/lesson-tracking/{lessonCode}
     *
     * « متابعة القسم » d'une leçon : chaque élève actif, son état sur chaque كفاءة et ce qu'il a fait de chaque exercice.
     */
    public function lessonTracking(Request $request, int $id, string $lessonCode)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        try {
            $tracking = $this->points->lessonTracking($classroom, $lessonCode);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, ...$tracking]);
    }

    public function show(Request $request, int $id, string $code)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        try {
            $detail = $this->points->learningPointDetail($classroom, $code);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, ...$detail]);
    }

    /**
     * GET /teacher/classrooms/{id}/students/{studentId}/learning-points/{code}/explanation
     *
     * La preuve d'un point pour UN élève membre actif : l'explication du
     * moteur, l'histoire de son état, ses notes de cahier sur ce point, les
     * interventions de l'enseignant qui l'ont visé sur ce point.
     */
    public function explanation(Request $request, int $id, int $studentId, string $code)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $student = ClassroomAccess::activeStudent($classroom, $studentId);

        try {
            $evidence = $this->points->studentEvidence($classroom, $student, $code);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        $interventions = array_values(array_filter(
            $this->interventions->forStudent($classroom, $request->user(), $student),
            fn ($i) => ($i['learningPoint']['code'] ?? null) === $code,
        ));

        return response()->json([
            'success' => true,
            'student' => ClassroomAccess::identity($student),
            ...$evidence,
            'interventions' => $interventions,
        ]);
    }
}
