<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Access\AccessTier;
use App\Domain\Admin\ContentService;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminContentController extends Controller
{
    public function __construct(private ContentService $content) {}

    public function lessons(Request $request)
    {
        $lessons = $this->content->lessons($request->query());

        return response()->json([
            'success' => true,
            'lessons' => $lessons->through(fn (Lesson $lesson) => $this->serializeLesson($lesson)),
        ]);
    }

    public function lesson(string $code)
    {
        try {
            $lesson = $this->content->lesson($code);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'lesson' => $this->serializeLesson($lesson) + [
                'modules' => $lesson->modules->map(fn ($m) => [
                    'id' => $m->id,
                    'code' => $m->code,
                    'number' => $m->number,
                    'title' => $m->title,
                    'stage' => $m->stage,
                    'estimatedMin' => $m->estimated_min,
                    'difficulty' => $m->difficulty,
                    'teachesLearningPointCodes' => $m->teaches_learning_point_codes,
                    'publicationStatus' => $m->publication_status,
                    'retiredAt' => $m->retired_at,
                ]),
                'exercises' => $lesson->practiceExercises->map(fn ($e) => [
                    'id' => $e->id,
                    'exerciseCode' => $e->exercise_code,
                    'level' => $e->level,
                    'title' => $e->title,
                    'questionCount' => $e->question_count,
                    'publicationStatus' => $e->publication_status,
                    'tier' => $e->tier,
                    'effectiveTier' => AccessTier::effective($e->tier, $e->lesson?->tier),
                    'retiredAt' => $e->retired_at,
                ]),
                'learningPoints' => $lesson->learningPoints->map(fn ($lp) => [
                    'id' => $lp->id,
                    'code' => $lp->code,
                    'title' => $lp->title,
                    'order' => $lp->order,
                ]),
            ],
        ]);
    }

    /** Tous les modules, toutes leçons confondues. */
    public function modules(Request $request)
    {
        $modules = $this->content->modules($request->query());

        return response()->json([
            'success' => true,
            'modules' => $modules->through(fn ($module) => [
                'id' => $module->id,
                'code' => $module->code,
                'number' => $module->number,
                'title' => $module->title,
                'stage' => $module->stage,
                'estimatedMin' => $module->estimated_min,
                'difficulty' => $module->difficulty,
                'learningPointCount' => count($module->teaches_learning_point_codes ?? []),
                'publicationStatus' => $module->publication_status,
                'lessonCode' => $module->lesson?->code,
                'lessonTitle' => $module->lesson?->title,
                'grade' => $module->lesson?->chapter?->grade?->code,
                'chapterTitle' => $module->lesson?->chapter?->title,
            ]),
        ]);
    }

    /** Tous les exercices, toutes leçons confondues. */
    public function exercises(Request $request)
    {
        $exercises = $this->content->exercises($request->query());

        return response()->json([
            'success' => true,
            'exercises' => $exercises->through(fn ($exercise) => [
                'id' => $exercise->id,
                'exerciseCode' => $exercise->exercise_code,
                'level' => $exercise->level,
                'title' => $exercise->title,
                'questionCount' => $exercise->question_count,
                'publicationStatus' => $exercise->publication_status,
                'tier' => $exercise->tier,
                'effectiveTier' => AccessTier::effective($exercise->tier, $exercise->lesson?->tier),
                // Le palier de la LEÇON, pour que la vue transversale sache
                // de quoi un exercice hérite. Sans lui, « Hérité » ne dirait
                // pas hérité de quoi, et l'administrateur devrait ouvrir la
                // leçon pour le savoir.
                'lessonTier' => $exercise->lesson?->tier,
                'lessonCode' => $exercise->lesson?->code,
                'lessonTitle' => $exercise->lesson?->title,
                'grade' => $exercise->lesson?->chapter?->grade?->code,
            ]),
        ]);
    }

    /**
     * Publier / masquer / archiver. Un seul point d'entrée pour les trois
     * niveaux de contenu, donc une seule validation et un seul journal.
     */
    public function changeStatus(Request $request, string $type, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Lesson::PUBLICATION_STATUSES)],
        ], [
            'status.in' => 'État de publication inconnu.',
        ]);

        try {
            $result = $this->content->changeStatus($request->user(), $type, $id, $validated['status']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'changed' => $result['changed'],
            'id' => $result['model']->id,
            'publicationStatus' => $result['model']->publication_status,
        ]);
    }

    /**
     * Changer le PALIER commercial — gratuit / payant.
     *
     * Point d'entrée distinct de changeStatus : publication et palier sont
     * deux dimensions indépendantes (voir ContentService::changeTier).
     * `tier: null` n'est valable que pour un exercice, où il signifie
     * « hérite de sa leçon ».
     */
    public function changeTier(Request $request, string $type, int $id)
    {
        $validated = $request->validate([
            'tier' => ['present', 'nullable', Rule::in(AccessTier::TIERS)],
        ], [
            'tier.in' => 'Palier inconnu.',
        ]);

        try {
            $result = $this->content->changeTier($request->user(), $type, $id, $validated['tier']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'changed' => $result['changed'],
            'id' => $result['model']->id,
            'tier' => $result['model']->tier,
            // La publication est renvoyée telle quelle, pour rendre visible
            // qu'elle n'a PAS bougé.
            'publicationStatus' => $result['model']->publication_status,
        ]);
    }

    private function serializeLesson(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id,
            'code' => $lesson->code,
            'title' => $lesson->title,
            'description' => $lesson->description,
            'grade' => $lesson->chapter?->grade?->code,
            'gradeName' => $lesson->chapter?->grade?->name,
            'chapter' => $lesson->chapter?->code,
            'chapterTitle' => $lesson->chapter?->title,
            'publicationStatus' => $lesson->publication_status,
            'catalogueStatus' => $lesson->status,
            'tier' => $lesson->tier,
            'durationMinutes' => $lesson->duration_minutes,
            'publishedAt' => $lesson->published_at,
            'archivedAt' => $lesson->archived_at,
            'updatedAt' => $lesson->updated_at,
            'modulesCount' => $lesson->modules_count,
            'exercisesCount' => $lesson->exercises_count,
            'openReportsCount' => $lesson->open_reports_count,
            'studentsCount' => $lesson->students_count,
        ];
    }
}
