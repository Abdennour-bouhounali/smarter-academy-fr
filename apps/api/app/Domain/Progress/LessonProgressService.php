<?php

namespace App\Domain\Progress;

use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Lesson progression writes (cross-device). The merge rules make replays and
 * out-of-order flushes from offline queues safe:
 *
 *   completed_modules  → set union: merging never removes a completion.
 *   current_module     → latest wins: only an update whose lastActivityAt is
 *                        at or after the stored one may move the position.
 *   status             → monotonic: in_progress → completed only; completed_at
 *                        is set once and never cleared.
 *
 * This is deliberately NOT mastery — knowledge progression lives in
 * student_learning_point_progress via ProgressEngine, and the two are never
 * merged (completion ≠ mastery).
 */
class LessonProgressService
{
    /**
     * @param  array{completedModules: string[], currentModule: ?int, status: string, lastActivityAt: string, completionMode?: ?string}  $payload
     */
    public function upsert(User $user, Lesson $lesson, array $payload): StudentLessonProgress
    {
        $incomingAt = Carbon::parse($payload['lastActivityAt']);

        return DB::transaction(function () use ($user, $lesson, $payload, $incomingAt) {
            $row = StudentLessonProgress::where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->lockForUpdate()
                ->first();

            if ($row === null) {
                $row = new StudentLessonProgress([
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                    'status' => StudentLessonProgress::STATUS_IN_PROGRESS,
                    'completed_modules' => [],
                    'current_module' => null,
                    'last_activity_at' => $incomingAt,
                ]);
            }

            $row->completed_modules = array_values(array_unique(array_merge(
                $row->completed_modules ?? [],
                $payload['completedModules']
            )));

            if ($incomingAt->greaterThanOrEqualTo($row->last_activity_at)) {
                if ($payload['currentModule'] !== null) {
                    $row->current_module = $payload['currentModule'];
                }
                $row->last_activity_at = $incomingAt;
            }

            if ($payload['status'] === StudentLessonProgress::STATUS_COMPLETED
                && $row->status !== StudentLessonProgress::STATUS_COMPLETED) {
                $row->status = StudentLessonProgress::STATUS_COMPLETED;
                $row->completed_at = $row->completed_at ?? now();
                // 'path' (journey to the final evaluation) or 'mastery' (the
                // always-open evaluation demonstrated mastery directly) —
                // recorded once, alongside completed_at.
                $row->completion_mode = $payload['completionMode']
                    ?? StudentLessonProgress::COMPLETION_MODE_PATH;
            }

            $row->save();

            return $row;
        });
    }

    /**
     * Every progress row for the user, keyed by lesson code — the dashboard /
     * resume hydration read.
     *
     * @return array<string, array<string, mixed>>
     */
    public function forUser(User $user): array
    {
        $progress = [];
        $rows = StudentLessonProgress::where('user_id', $user->id)
            ->with('lesson:id,code')
            ->get();

        foreach ($rows as $row) {
            $progress[$row->lesson->code] = self::serialize($row);
        }

        return $progress;
    }

    /**
     * @return array<string, mixed>
     */
    public static function serialize(StudentLessonProgress $row): array
    {
        return [
            'status' => $row->status,
            'currentModule' => $row->current_module,
            'completedModules' => $row->completed_modules,
            'lastActivityAt' => $row->last_activity_at?->toIso8601String(),
            'completedAt' => $row->completed_at?->toIso8601String(),
            'completionMode' => $row->completion_mode,
        ];
    }
}
