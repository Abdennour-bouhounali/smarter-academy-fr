<?php

namespace App\Http\Controllers;

use App\Domain\Progress\Support\Freshness;
use App\Domain\Progress\Support\LearningProfileBuilder;
use App\Models\StudentLearningPointProgress;
use Illuminate\Http\Request;

class LearningProfileController extends Controller
{
    /**
     * The student's full learning profile: initialKnowledge (each grade's
     * completed diagnostic baseline, read-only — lesson evidence never
     * touches it) + currentMastery (the live learning-point rollup). Always
     * scoped to the token's user.
     *
     * Filtres facultatifs (Mastery V2) : `?lesson=`, `?unit=`, `?grade=` —
     * une page de leçon ne lit que les points de sa leçon, jamais tout le
     * profil. Chaque point porte sa raison de statut, ses compteurs de
     * preuve, sa fraîcheur (dérivée) et la version du moteur qui l'a écrit.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $filters = $request->validate([
            'lesson' => 'nullable|string|max:120',
            'unit' => 'nullable|string|max:120',
            'grade' => 'nullable|string|max:40',
        ]);

        // Latest COMPLETED diagnostic per grade — the frozen baseline. An
        // in-progress session isn't a baseline yet.
        $baselines = $user->diagnosticSessions()
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->get()
            ->unique('grade')
            ->map(fn ($session) => [
                'grade' => $session->grade,
                'completedAt' => $session->completed_at?->toIso8601String(),
                'profile' => $session->profile_summary,
            ])
            ->values()
            ->all();

        $masteryRows = StudentLearningPointProgress::query()
            ->where('user_id', $user->id)
            ->when($filters['lesson'] ?? null, fn ($q, $code) => $q->whereHas('learningPoint.lesson', fn ($l) => $l->where('code', $code)))
            ->when($filters['unit'] ?? null, fn ($q, $code) => $q->whereHas('learningPoint.lesson.unit', fn ($u) => $u->where('code', $code)))
            ->when($filters['grade'] ?? null, fn ($q, $code) => $q->whereHas('learningPoint.lesson.chapter.grade', fn ($g) => $g->where('code', $code)))
            ->with('learningPoint.lesson.chapter.grade')
            ->get()
            ->map(fn ($progress) => [
                'learningPointCode' => $progress->learningPoint->code,
                'learningPointTitle' => $progress->learningPoint->title,
                'lessonCode' => $progress->learningPoint->lesson->code,
                'lessonTitle' => $progress->learningPoint->lesson->title,
                'chapterCode' => $progress->learningPoint->lesson->chapter->code,
                'gradeCode' => $progress->learningPoint->lesson->chapter->grade->code,
                'status' => $progress->status,
                'statusReason' => $progress->status_reason,
                'confidence' => (float) $progress->confidence,
                'attempts' => $progress->attempts,
                'correctCount' => $progress->correct_count,
                'partialCount' => (int) $progress->partial_count,
                'failureCount' => (int) $progress->failure_count,
                'distinctItemsSuccess' => (int) $progress->distinct_items_success,
                'distinctItemsAttempted' => (int) $progress->distinct_items_attempted,
                'assessmentSuccessCount' => (int) $progress->assessment_success_count,
                'maxDifficultySuccess' => (int) $progress->max_difficulty_success,
                'lastEvidenceAt' => $progress->last_evidence_at?->toIso8601String(),
                'lastSuccessAt' => $progress->last_success_at?->toIso8601String(),
                'lastFailureAt' => $progress->last_failure_at?->toIso8601String(),
                'freshness' => Freshness::of($progress->last_evidence_at),
                'engineVersion' => (int) $progress->engine_version,
                'diagnosticSkillId' => $progress->learningPoint->diagnostic_skill_id,
            ])
            ->all();

        return response()->json([
            'success' => true,
            'profile' => LearningProfileBuilder::build($baselines, $masteryRows),
        ]);
    }
}
