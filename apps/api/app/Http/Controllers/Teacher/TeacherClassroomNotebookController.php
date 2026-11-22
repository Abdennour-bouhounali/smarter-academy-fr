<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\Practice\NotebookPresenter;
use App\Domain\Practice\NotebookService;
use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Classroom;
use App\Models\NotebookNote;
use App\Models\User;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * LE CAHIER D'UN ÉLÈVE, LU PAR SON ENSEIGNANT — en LECTURE SEULE.
 *
 * ── Ce qui a changé, et pourquoi c'est écrit ici ─────────────────────────
 * Jusqu'au 2026-09-24, le cahier était STRICTEMENT privé : « Personne
 * d'autre que l'élève ne lit le cahier » (NOTEBOOK.md), et le dossier d'un
 * élève excluait explicitement ses notes. Le propriétaire du produit a
 * décidé d'ouvrir une lecture à l'enseignant du قسم, parce que les erreurs
 * qu'un élève NOTE lui-même disent ce qu'aucun pourcentage de réussite ne
 * dit. Ce contrôleur est la seule porte de cette lecture.
 *
 * Ce qui n'a PAS changé, et ne doit pas :
 *
 *  · la lecture est SEULE — aucune écriture n'est exposée ici. Modifier,
 *    archiver, réviser ou supprimer passent par PracticeNotebookController
 *    et `ownedBy()`, qui exige d'être le propriétaire ;
 *  · le périmètre est la CLASSE — les leçons effectives du قسم, et elles
 *    seules (NotebookService::searchForReader). Ce qu'un élève écrit dans
 *    une leçon d'un autre niveau, dans une leçon masquée par cet
 *    enseignant, ou hors de toute leçon, reste privé ;
 *  · l'élève est résolu PAR la classe possédée, jamais par un identifiant
 *    libre — la règle de TeacherClassroomStudentController.
 *
 * ── Les trois verrous, dans l'ordre ──────────────────────────────────────
 *
 *     can:teacher            le rôle          (routes/api.php)
 *     ClassroomPolicy@view   la classe est à CET enseignant
 *     activeStudent()        l'élève est MEMBRE ACTIF de cette classe active
 *                            (ClassroomAccess — un élève parti n'est plus lu)
 *
 * Aucun n'est décoratif : retirer le dernier laisserait un enseignant lire
 * le cahier de n'importe quel élève en changeant un identifiant dans l'URL.
 * TeacherClassroomNotebookTest les vérifie un par un.
 */
class TeacherClassroomNotebookController extends Controller
{
    public function __construct(
        private NotebookService $notebook,
        private ClassroomProgressService $progress,
        private ActivityLogger $log,
    ) {}

    /**
     * GET /teacher/classrooms/{id}/students/{studentId}/notebook
     *
     * La même page que « Mon cahier » de l'élève : mêmes vues, mêmes
     * filtres, même tri, même pagination — bornée aux leçons de la classe.
     */
    public function index(Request $request, int $id, int $studentId)
    {
        $params = $request->validate([
            'q' => 'nullable|string|max:120',
            'view' => ['nullable', Rule::in(NotebookService::VIEWS)],
            'lessonCode' => 'nullable|string|max:120',
            'learningPointCode' => 'nullable|string|max:255',
            'origin' => 'nullable|in:lesson,exercise',
            'type' => ['nullable', Rule::in(NotebookNote::TYPES)],
            'sort' => ['nullable', Rule::in(NotebookService::SORTS)],
            'page' => 'nullable|integer|min:1',
            'perPage' => 'nullable|integer|min:1|max:100',
        ]);

        [$classroom, $student] = $this->reachable($request, $id, $studentId);
        $lessonIds = $this->progress->effectiveLessonIds($classroom);

        $page = $this->notebook->searchForReader($student, $lessonIds, $params);
        $this->traceRead($request, $classroom, $student);
        $modules = $this->notebook->modulesFor($page['notes']);

        return response()->json([
            'success' => true,
            'student' => $this->identity($student),
            'notes' => $page['notes']->map(fn (NotebookNote $note) => NotebookPresenter::note($note, $modules))->all(),
            'meta' => [
                'total' => $page['total'],
                'page' => $page['page'],
                'perPage' => $page['perPage'],
                'hasMore' => $page['hasMore'],
            ],
            'counts' => $this->notebook->countsForReader($student, $lessonIds),
            // Le lecteur ne peut RIEN écrire : l'interface le sait par là, et
            // n'a pas à le déduire d'un rôle.
            'readOnly' => true,
        ]);
    }

    /**
     * GET /teacher/classrooms/{id}/students/{studentId}/notebook/{noteId}
     *
     * Une note hors périmètre répond 404, comme la note d'un inconnu : on ne
     * révèle pas ce qui existe ailleurs dans le cahier.
     */
    public function show(Request $request, int $id, int $studentId, int $noteId)
    {
        [$classroom, $student] = $this->reachable($request, $id, $studentId);
        $lessonIds = $this->progress->effectiveLessonIds($classroom);

        try {
            $note = $this->notebook->findForReader($student, $noteId, $lessonIds);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json([
            'success' => true,
            'student' => $this->identity($student),
            'note' => NotebookPresenter::note($note, $this->notebook->modulesFor([$note])),
            'readOnly' => true,
        ]);
    }

    /**
     * La classe possédée ET l'élève qui en est membre — les deux verrous qui
     * suivent le rôle. 404 si l'un des deux ne tient pas.
     *
     * @return array{0: Classroom, 1: User}
     */
    private function reachable(Request $request, int $id, int $studentId): array
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return [$classroom, ClassroomAccess::activeStudent($classroom, $studentId)];
    }

    /**
     * Une lecture du cahier d'un élève laisse une trace — une ligne par
     * enseignant, par élève et par jour, pas une par page tournée.
     */
    private function traceRead(Request $request, Classroom $classroom, User $student): void
    {
        $already = AdminActivityLog::where('user_id', $request->user()->id)
            ->where('action', ActivityLogger::TEACHER_NOTEBOOK_READ)
            ->where('entity_type', 'user')->where('entity_id', (string) $student->id)
            ->where('created_at', '>=', now()->startOfDay())
            ->exists();
        if (! $already) {
            $this->log->log($request->user(), ActivityLogger::TEACHER_NOTEBOOK_READ, 'user', $student->id, null, ['classroom_id' => $classroom->id]);
        }
    }

    /** De qui on lit le cahier — l'identité enseignant, jamais le courriel. */
    private function identity(User $student): array
    {
        return ClassroomAccess::identity($student);
    }
}
