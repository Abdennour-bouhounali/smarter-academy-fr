<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomException;
use App\Domain\Classroom\ClassroomService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use DomainException;
use Illuminate\Http\Request;

/**
 * Les classes d'un enseignant.
 *
 * Trois couches : la route (can:teacher), la politique (`authorize`, qui
 * répond 403 pour la classe d'un autre), et l'offre (le service, qui refuse
 * en 422 avec un motif). `teacher_id` n'est jamais lu du corps.
 */
class TeacherClassroomController extends Controller
{
    public function __construct(
        private ClassroomService $classrooms,
        private PlanEntitlementResolver $entitlements,
    ) {}

    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'classrooms' => $this->classrooms->listFor($request->user())->map(fn (Classroom $c) => self::serialize($c))->values(),
            'entitlements' => $this->entitlements->summaryFor($request->user()),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'grade' => 'required|string|max:50',
            'academicYear' => ['nullable', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ]);

        try {
            $classroom = $this->classrooms->create($request->user(), $validated);
        } catch (DomainException $e) {
            return $this->refuse($e);
        }

        return response()->json([
            'success' => true,
            'classroom' => self::serialize($classroom->loadCount(['activeMemberships as students_count'])),
            'entitlements' => $this->entitlements->summaryFor($request->user()),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $classroom = $this->owned($request, $id);
        $classroom->loadCount(['activeMemberships as students_count']);

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom)]);
    }

    public function update(Request $request, int $id)
    {
        $classroom = $this->owned($request, $id, 'update');

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'description' => 'sometimes|nullable|string|max:500',
            'academicYear' => ['sometimes', 'nullable', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'joinCodeEnabled' => 'sometimes|boolean',
        ]);

        $classroom = $this->classrooms->update($request->user(), $classroom, $validated);

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom->loadCount(['activeMemberships as students_count']))]);
    }

    public function archive(Request $request, int $id)
    {
        $classroom = $this->classrooms->archive($request->user(), $this->owned($request, $id, 'manage'));

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom), 'entitlements' => $this->entitlements->summaryFor($request->user())]);
    }

    public function restore(Request $request, int $id)
    {
        try {
            $classroom = $this->classrooms->restore($request->user(), $this->owned($request, $id, 'manage'));
        } catch (DomainException $e) {
            return $this->refuse($e);
        }

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom), 'entitlements' => $this->entitlements->summaryFor($request->user())]);
    }

    public function rotateJoinCode(Request $request, int $id)
    {
        $classroom = $this->classrooms->rotateJoinCode($request->user(), $this->owned($request, $id, 'manage'));

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom)]);
    }

    public function rotateJoinLink(Request $request, int $id)
    {
        $classroom = $this->classrooms->rotateJoinLink($request->user(), $this->owned($request, $id, 'manage'));

        return response()->json(['success' => true, 'classroom' => self::serialize($classroom)]);
    }

    /**
     * La classe, SI elle est à cet enseignant. 404 si elle n'existe pas,
     * 403 si elle est à un autre — la politique tranche.
     */
    public static function ownedClassroom(Request $request, int $id, string $ability = 'view'): Classroom
    {
        $classroom = Classroom::find($id);
        if ($classroom === null) {
            abort(404);
        }
        if ($request->user()->cannot($ability, $classroom)) {
            abort(403);
        }

        return $classroom;
    }

    private function owned(Request $request, int $id, string $ability = 'view'): Classroom
    {
        return self::ownedClassroom($request, $id, $ability);
    }

    /** @return array<string, mixed> */
    public static function serialize(Classroom $c): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'description' => $c->description,
            'grade' => $c->grade,
            'academicYear' => $c->academic_year,
            // Rattachée à l'établissement de l'enseignant (SCHOOL_ADMIN_SPACE.md) ?
            'schoolId' => $c->school_id,
            'status' => $c->status,
            'joinCode' => $c->join_code,
            // « الانضمام مفتوح » : ferme le lien ET le code (nom historique).
            'joinCodeEnabled' => $c->join_code_enabled,
            // Le jeton seul ; le client compose l'URL sur sa propre origine
            // (/rejoindre/classe/{jeton}). Rendu au seul propriétaire.
            'joinLinkToken' => $c->join_link_token,
            'studentsCount' => $c->students_count ?? null,
            'archivedAt' => optional($c->archived_at)->toIso8601String(),
            'createdAt' => optional($c->created_at)->toIso8601String(),
        ];
    }

    /** Un refus MÉTIER : 422, avec le motif clos si le domaine en a un. */
    public static function refuse(DomainException $e)
    {
        return response()->json([
            'success' => false,
            'reason' => $e instanceof ClassroomException ? $e->reason : null,
            'message' => $e->getMessage(),
        ], 422);
    }
}
