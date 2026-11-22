<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

/**
 * Le curriculum en LECTURE, tel que la base le reflète : classe → chapitres
 * (ميادين) → unités du manuel (الوحدات) → leçons (دروس) → points
 * d'apprentissage, avec les prérequis pédagogiques et les ressources
 * déclarées (manipulations, méthodes, situations).
 *
 * L'API parle en CODES (master spec §14) : aucun texte n'est destiné à être
 * affiché tel quel par le client, qui possède le catalogue en arabe ; ce
 * qu'on sert ici, c'est la STRUCTURE et ses identifiants — pour un client
 * futur (mobile, enseignant) et pour l'analyse. Les titres arabes sont
 * inclus parce qu'ils sont des données du catalogue, pas des messages.
 *
 * Chargement anticipé systématique : aucune requête par leçon ou par point.
 */
class CurriculumController extends Controller
{
    public function grade(string $gradeCode): JsonResponse
    {
        $grade = Grade::where('code', $gradeCode)
            ->where('is_active', true)
            ->with([
                'chapters' => fn ($q) => $q->orderBy('order'),
                'chapters.units' => fn ($q) => $q->orderBy('order'),
                'chapters.lessons' => fn ($q) => $q->orderBy('order'),
                'chapters.lessons.learningPoints' => fn ($q) => $q->whereNull('retired_at')->orderBy('order'),
                'chapters.lessons.learningPoints.prerequisites',
                'chapters.lessons.prerequisites:id,code',
            ])
            ->first();

        if (! $grade) {
            return response()->json(['success' => false, 'reason' => 'grade_not_found'], 404);
        }

        return response()->json([
            'success' => true,
            'grade' => [
                'code' => $grade->code,
                'name' => $grade->name,
                'level' => $grade->level,
                'chapters' => $grade->chapters->map(fn ($chapter) => [
                    'code' => $chapter->code,
                    'title' => $chapter->title,
                    'order' => $chapter->order,
                    'topics' => $chapter->topics,
                    'units' => $chapter->units->map(fn ($unit) => $this->serializeUnit($unit))->values(),
                    'lessons' => $chapter->lessons->map(fn ($lesson) => $this->serializeLesson($lesson))->values(),
                ])->values(),
            ],
        ]);
    }

    public function lesson(string $lessonCode): JsonResponse
    {
        $lesson = Lesson::where('code', $lessonCode)
            ->with([
                'chapter.grade',
                'unit',
                'learningPoints' => fn ($q) => $q->whereNull('retired_at')->orderBy('order'),
                'learningPoints.prerequisites',
                'prerequisites:id,code,title,kind',
                'modules' => fn ($q) => $q->whereNull('retired_at')->orderBy('number'),
                'resources' => fn ($q) => $q->whereNull('retired_at')->orderBy('order'),
                'practiceExercises' => fn ($q) => $q->whereNull('retired_at')->orderBy('level'),
            ])
            ->first();

        if (! $lesson || ! $lesson->chapter?->grade?->is_active) {
            return response()->json(['success' => false, 'reason' => 'lesson_not_found'], 404);
        }

        return response()->json([
            'success' => true,
            'lesson' => $this->serializeLesson($lesson) + [
                'chapter' => ['code' => $lesson->chapter->code, 'title' => $lesson->chapter->title],
                'grade' => ['code' => $lesson->chapter->grade->code, 'name' => $lesson->chapter->grade->name],
                'unit' => $lesson->unit ? $this->serializeUnit($lesson->unit) : null,
                'modules' => $lesson->modules->map(fn ($m) => [
                    'code' => $m->code, 'number' => $m->number, 'slug' => $m->slug, 'title' => $m->title,
                    'stage' => $m->stage, 'estimatedMin' => $m->estimated_min, 'difficulty' => $m->difficulty,
                    'teachesLearningPointCodes' => $m->teaches_learning_point_codes, 'publicationStatus' => $m->publication_status,
                ])->values(),
                'resources' => $lesson->resources->map(fn ($r) => [
                    'code' => $r->code, 'kind' => $r->kind, 'type' => $r->type, 'title' => $r->title,
                    'moduleNumber' => $r->module_number, 'learningPointCodes' => $r->learning_point_codes,
                    'sourceElementIds' => $r->source_element_ids, 'config' => $r->config,
                ])->values(),
                'practiceExercises' => $lesson->practiceExercises->map(fn ($e) => [
                    'code' => $e->exercise_code, 'level' => $e->level, 'title' => $e->title, 'questionCount' => $e->question_count,
                    'publicationStatus' => $e->publication_status,
                ])->values(),
            ],
        ]);
    }

    private function serializeUnit($unit): array
    {
        return [
            'code' => $unit->code, 'title' => $unit->title, 'subtitle' => $unit->subtitle, 'number' => $unit->number,
            'objectives' => $unit->objectives, 'sourceTopicCodes' => $unit->source_topic_codes, 'textbook' => $unit->textbook, 'order' => $unit->order,
        ];
    }

    private function serializeLesson($lesson): array
    {
        return [
            'code' => $lesson->code,
            'kind' => $lesson->kind,
            'unitCode' => $lesson->unit?->code ?? ($lesson->relationLoaded('unit') ? null : null),
            'title' => $lesson->title,
            'titleSource' => $lesson->title_source,
            'description' => $lesson->description,
            'status' => $lesson->status,
            'tier' => $lesson->tier,
            'order' => $lesson->order,
            'durationMinutes' => $lesson->duration_minutes,
            'textbookRef' => $lesson->textbook_ref,
            'prerequisiteLessonCodes' => $lesson->prerequisites->pluck('code')->values(),
            'learningPoints' => $lesson->learningPoints->map(fn ($lp) => [
                'code' => $lp->code,
                'title' => $lp->title,
                'order' => $lp->order,
                'prerequisites' => $lp->prerequisites->map(fn ($p) => [
                    'code' => $p->code,
                    'requiredMastery' => (float) $p->pivot->required_mastery,
                ])->values(),
            ])->values(),
        ];
    }
}
