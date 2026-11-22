<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomInterventionService;
use App\Http\Controllers\Controller;
use App\Models\ClassroomIntervention;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Les interventions d'un قسم — créer, lire (avec leur mesure), clore.
 *
 * Trois verrous : le rôle (groupe de routes), la classe possédée
 * (ClassroomPolicy, `manage` pour écrire), et l'intervention résolue PAR la
 * classe ET par l'enseignant (findFor) — jamais par un identifiant libre.
 * Les élèves visés doivent être membres ACTIFS (ClassroomAccess).
 */
class TeacherClassroomInterventionController extends Controller
{
    public function __construct(private ClassroomInterventionService $interventions) {}

    public function index(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $filters = $request->validate([
            'status' => ['nullable', Rule::in([ClassroomIntervention::STATUS_OPEN, ClassroomIntervention::STATUS_CLOSED])],
            'studentId' => 'nullable|integer',
            'learningPointCode' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'perPage' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $page = $this->interventions->list($classroom, $request->user(), $filters);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, ...$page]);
    }

    public function store(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate([
            'kind' => ['required', Rule::in(ClassroomIntervention::KINDS)],
            'studentIds' => 'required|array|min:1|max:60',
            'studentIds.*' => 'integer',
            'learningPointCode' => 'nullable|string|max:255',
            'lessonCode' => 'nullable|string|max:120',
            'note' => 'nullable|string|max:2000',
            'studentMessage' => 'nullable|string|max:500',
            'reviewAfter' => 'nullable|date|after_or_equal:today',
            'sourceSignal' => 'nullable|string|max:48',
        ]);

        try {
            $intervention = $this->interventions->create($request->user(), $classroom, $data);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, 'intervention' => $this->interventions->show($classroom, $intervention)], 201);
    }

    public function show(Request $request, int $id, int $interventionId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $intervention = $this->interventions->findFor($classroom, $request->user(), $interventionId);

        return response()->json(['success' => true, 'intervention' => $this->interventions->show($classroom, $intervention)]);
    }

    public function update(Request $request, int $id, int $interventionId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $intervention = $this->interventions->findFor($classroom, $request->user(), $interventionId);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in([ClassroomIntervention::STATUS_OPEN, ClassroomIntervention::STATUS_CLOSED])],
            'note' => 'sometimes|nullable|string|max:2000',
            'reviewAfter' => 'sometimes|nullable|date',
        ]);

        $intervention = $this->interventions->update($request->user(), $intervention, $data);

        return response()->json(['success' => true, 'intervention' => $this->interventions->show($classroom, $intervention)]);
    }
}
