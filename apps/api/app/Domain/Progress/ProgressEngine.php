<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Support\MasteryModel;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * The one thing LearningEvidenceController talks to. Validates every
 * relationship server-side (the student comes from the Sanctum token, the
 * lesson from its code, and every learning point must belong to THAT lesson
 * — frontend-supplied ids are never trusted), then records the evidence and
 * rolls the per-(student, learning point) mastery forward.
 *
 * Trust boundary (deliberate asymmetry from the diagnostic): lesson question
 * content lives in JSX, so the server CANNOT recompute correctness the way
 * AnswerChecker does for the diagnostic's PHP-owned questions. is_correct is
 * client-reported; what the server owns is the relationship validation and
 * the mastery bookkeeping.
 */
class ProgressEngine
{
    /**
     * Idempotent by attemptId: a retried submission (dropped connection, the
     * offline queue flushing twice) returns the stored result instead of
     * double-counting evidence.
     *
     * Takes the lesson CODE, not a Lesson row: lesson codes repeat across
     * grades ('resolution-problemes' exists for both 6e and 3e), so the
     * actual lesson is disambiguated through the submitted learning-point
     * codes — globally unique, grade-embedded — and then required to match
     * the code the client claimed. See resolveLesson().
     *
     * @param  array{questionCode: string, attemptId: string, isCorrect: bool, learningPointCodes: string[], assessmentType?: string, answer?: array|null}  $payload
     * @return array{evidence: LearningEvidence, duplicate: bool}
     */
    public function recordEvidence(User $user, string $lessonCode, array $payload): array
    {
        // Only authoritative assessment evidence is accepted — discovery and
        // practice never reach mastery, even if a misconfigured client tries
        // (defense in depth behind the frontend's own type check).
        $type = $payload['assessmentType'] ?? 'assessment';
        if ($type !== 'assessment') {
            throw new DomainException('Seules les questions d\'évaluation génèrent une preuve d\'apprentissage.');
        }

        $existing = LearningEvidence::where('attempt_id', $payload['attemptId'])->first();
        if ($existing) {
            if ($existing->user_id !== $user->id) {
                // Another student's attempt id — treat as invalid rather than
                // leaking that the id exists.
                throw new DomainException('Tentative invalide.');
            }

            return ['evidence' => $existing, 'duplicate' => true];
        }

        [$lesson, $points] = $this->resolveLesson($lessonCode, $payload['learningPointCodes']);

        $evidence = DB::transaction(function () use ($user, $lesson, $payload, $points) {
            $evidence = LearningEvidence::create([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'question_code' => $payload['questionCode'],
                'attempt_id' => $payload['attemptId'],
                'is_correct' => $payload['isCorrect'],
                'assessment_type' => 'assessment',
                'answer' => $payload['answer'] ?? null,
                'submitted_at' => now(),
            ]);

            $evidence->learningPoints()->attach($points->pluck('id'));

            foreach ($points as $point) {
                $this->updateProgress($user, $point->id, $payload['isCorrect']);
            }

            return $evidence;
        });

        return ['evidence' => $evidence, 'duplicate' => false];
    }

    /**
     * Resolves the learning points GLOBALLY by their (unique) codes, then
     * derives the lesson from them: all points must belong to one single
     * lesson, and that lesson's code must be the one the client claimed. A
     * nonexistent, retired, or cross-lesson code rejects the whole
     * submission, listing the offending codes.
     *
     * @param  string[]  $codes
     * @return array{0: Lesson, 1: \Illuminate\Database\Eloquent\Collection<int, LearningPoint>}
     */
    private function resolveLesson(string $lessonCode, array $codes): array
    {
        if ($codes === []) {
            throw new DomainException('Au moins un point d\'apprentissage est requis.');
        }

        $points = LearningPoint::whereNull('retired_at')
            ->whereIn('code', $codes)
            ->with('lesson')
            ->get();

        $missing = array_values(array_diff($codes, $points->pluck('code')->all()));
        if ($missing !== []) {
            throw new DomainException(
                'Points d\'apprentissage invalides : '.implode(', ', $missing)
            );
        }

        $lessons = $points->pluck('lesson')->unique('id');
        if ($lessons->count() !== 1) {
            throw new DomainException('Les points d\'apprentissage doivent appartenir à une seule leçon.');
        }

        /** @var Lesson $lesson */
        $lesson = $lessons->first();
        if ($lesson->code !== $lessonCode) {
            throw new DomainException(
                'Points d\'apprentissage invalides pour cette leçon : '.implode(', ', $codes)
            );
        }

        return [$lesson, $points];
    }

    private function updateProgress(User $user, int $learningPointId, bool $isCorrect): void
    {
        $progress = StudentLearningPointProgress::firstOrNew([
            'user_id' => $user->id,
            'learning_point_id' => $learningPointId,
        ]);

        $currentConfidence = $progress->exists
            ? (float) $progress->confidence
            : MasteryModel::STARTING_CONFIDENCE;

        $newConfidence = MasteryModel::updateConfidence($currentConfidence, $isCorrect);

        $progress->fill([
            'confidence' => $newConfidence,
            'status' => MasteryModel::statusFor($newConfidence),
            'attempts' => ($progress->attempts ?? 0) + 1,
            'correct_count' => ($progress->correct_count ?? 0) + ($isCorrect ? 1 : 0),
            'last_evidence_at' => now(),
        ])->save();
    }
}
