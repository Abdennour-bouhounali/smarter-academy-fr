<?php

namespace Tests\Support;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * De la preuve RÉELLE, par la seule porte (ProgressEngine::recordEvidence) :
 * les états, l'histoire et les signaux que lisent ces tests sont ceux que
 * produirait un élève, jamais des lignes posées à la main.
 */
trait LearningFixtures
{
    private int $evidenceSeq = 0;

    protected function answer(User $student, Lesson $lesson, LearningPoint $point, string $outcome, int $level = 3, ?Carbon $at = null, ?string $exercise = null): void
    {
        $this->evidenceSeq++;
        app(ProgressEngine::class)->recordEvidence($student, $lesson->code, array_filter([
            'attemptId' => 'fx-'.$student->id.'-'.$this->evidenceSeq,
            'exerciseCode' => $exercise ?? "ex-l{$level}-".str_pad((string) $this->evidenceSeq, 3, '0', STR_PAD_LEFT),
            'questionId' => 'q1',
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'outcome' => $outcome,
            'learningPointRefs' => [['code' => $point->code, 'role' => 'primary']],
            'level' => $level,
            'difficulty' => $level,
            'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
            'submittedAt' => $at?->toIso8601String(),
        ], fn ($v) => $v !== null));
    }

    /** N réponses sur N items distincts. */
    protected function answers(User $student, Lesson $lesson, LearningPoint $point, string $outcome, int $n, int $level = 3, ?Carbon $at = null): void
    {
        for ($i = 0; $i < $n; $i++) {
            $this->answer($student, $lesson, $point, $outcome, $level, $at);
        }
    }

    protected function point(Lesson $lesson, int $n): LearningPoint
    {
        return LearningPoint::create(['lesson_id' => $lesson->id, 'code' => "4am_{$lesson->code}_P{$n}", 'title' => "Point {$n}", 'order' => $n]);
    }

    /** @param  User[]  $students */
    protected function enrol(Classroom $classroom, array $students): void
    {
        foreach ($students as $s) {
            ClassroomMembership::factory()->in($classroom)->of($s)->create();
        }
    }
}
