<?php

namespace App\Domain\Practice;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Classroom\TeacherPracticeResponses;
use App\Models\AnswerImage;
use App\Models\AnswerReview;
use App\Models\QuestionAttempt;
use App\Models\User;
use App\Notifications\AnswerReviewedNotification;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * « تصحيح الإجابات » — la file de correction de l'enseignant et sa décision
 * (propriétaire, 2026-10-06 ; EXERCISE_CONTRACT.md § « Image answers and
 * teacher validation »).
 *
 * Périmètre : les élèves MEMBRES ACTIFS des classes non archivées de CET
 * enseignant (TeacherPracticeResponses::rosterOf, la même règle que tout le
 * dossier élève). Un élève qui quitte la classe sort de la file : ses copies
 * ne sont plus lisibles par l'ancien enseignant (404), elles restent à l'élève.
 *
 * La décision :
 *  - `verdict` (démonstration, copie en photo seulement) : la note de
 *    l'enseignant DEVIENT l'issue de la tentative — preuve de maîtrise
 *    (`evaluated_by = teacher`, sauf `counted: false`) et médaille selon le
 *    temps réellement passé (PracticeEvidenceRecorder::recordTeacherVerdict) ;
 *  - `feedback` (réponse saisie, déjà jugée par le serveur) : un avis sur la
 *    rédaction et les photos, qui ne change pas l'issue.
 * Dans les deux cas l'élève reçoit une notification dans l'application.
 */
class AnswerReviewService
{
    public const COMMENT_MAX = 2000;

    public const ALREADY_REVIEWED = 'already_reviewed';

    public function __construct(
        private TeacherPracticeResponses $responses,
        private PracticeEvidenceRecorder $recorder,
    ) {}

    /**
     * La file : les copies EN ATTENTE des élèves de l'enseignant, les plus
     * anciennes d'abord. `classroomId` restreint à une classe.
     *
     * @return array{total: int, items: array<int, array<string, mixed>>, classrooms: array<int, array{id: int, name: string}>}
     */
    public function queue(User $teacher, ?int $classroomId = null, int $limit = 50): array
    {
        $roster = $this->responses->rosterOf($teacher);
        $classrooms = $roster->flatten(1)->unique('id')->sortBy('name')->values()->all();
        if ($classroomId !== null) {
            $roster = $roster->filter(fn ($rooms) => collect($rooms)->contains('id', $classroomId));
        }
        if ($roster->isEmpty()) {
            return ['total' => 0, 'items' => [], 'classrooms' => $classrooms];
        }

        $query = AnswerReview::whereIn('student_id', $roster->keys())->where('status', AnswerReview::PENDING);
        $total = (clone $query)->count();
        $reviews = $query->orderBy('id')->limit($limit)
            ->with(['questionAttempt.exerciseAttempt.practiceSession.lesson', 'questionAttempt.images'])
            ->get();
        $users = User::whereIn('id', $reviews->pluck('student_id')->unique())
            ->get(explode(',', ClassroomAccess::IDENTITY_COLUMNS))->keyBy('id');

        return [
            'total' => $total,
            'items' => $reviews->map(fn (AnswerReview $r) => $this->item($r, $users[$r->student_id] ?? null, $roster))->values()->all(),
            'classrooms' => $classrooms,
        ];
    }

    /** Le compteur du menu de l'enseignant. */
    public function pendingCount(User $teacher): int
    {
        $roster = $this->responses->rosterOf($teacher);

        return $roster->isEmpty() ? 0
            : AnswerReview::whereIn('student_id', $roster->keys())->where('status', AnswerReview::PENDING)->count();
    }

    /**
     * L'enseignant juge. Une copie déjà corrigée ne se rejuge pas (la preuve
     * de maîtrise est immuable).
     *
     * @throws DomainException
     */
    public function decide(User $teacher, int $reviewId, string $verdict, ?string $comment): AnswerReview
    {
        $review = $this->visibleTo($teacher, $reviewId);
        if ($review->status !== AnswerReview::PENDING) {
            throw new DomainException(self::ALREADY_REVIEWED);
        }
        $comment = $comment !== null ? trim($comment) : null;

        $attempt = $review->questionAttempt;
        DB::transaction(function () use ($review, $teacher, $verdict, $comment, $attempt) {
            $review->update([
                'status' => AnswerReview::REVIEWED,
                'verdict' => $verdict,
                'comment' => $comment === '' ? null : $comment,
                'reviewer_id' => $teacher->id,
                'reviewed_at' => now(),
            ]);
            if ($review->kind === AnswerReview::KIND_VERDICT) {
                $this->recorder->recordTeacherVerdict($attempt, $verdict);
            }
        });

        $exerciseAttempt = $attempt->exerciseAttempt;
        $review->student->notify(new AnswerReviewedNotification(
            $review->fresh(),
            (string) $exerciseAttempt->practiceSession->lesson->code,
            (string) $exerciseAttempt->exercise_id,
        ));

        return $review->fresh();
    }

    /**
     * Une photo, si l'enseignant peut la lire : l'élève est dans ses classes
     * actives ET la copie attend (ou a reçu) une correction.
     *
     * @throws DomainException
     */
    public function imageForTeacher(User $teacher, string $uuid): AnswerImage
    {
        $image = AnswerImage::where('uuid', $uuid)->first();
        if ($image === null || $image->isExpired()
            || ! $this->responses->rosterOf($teacher)->has($image->user_id)) {
            throw new DomainException(AnswerImageStore::NOT_FOUND);
        }

        return $image;
    }

    /**
     * La correction, telle que l'élève l'ouvre depuis sa cloche : l'exercice,
     * TOUTES ses étapes répondues (pour redessiner la feuille), et l'étape
     * corrigée.
     *
     * @throws DomainException
     */
    public function forStudent(User $student, int $reviewId): array
    {
        $review = AnswerReview::where('id', $reviewId)->where('student_id', $student->id)->first();
        if ($review === null) {
            throw new DomainException('Correction introuvable.');
        }
        $attempt = $review->questionAttempt;
        $exerciseAttempt = $attempt->exerciseAttempt;
        $session = $exerciseAttempt->practiceSession;

        $questions = QuestionAttempt::where('exercise_attempt_id', $exerciseAttempt->id)
            ->whereNotNull('submitted_at')->orderBy('attempt_number')->with(['images', 'review'])->get()
            ->unique('question_id')
            ->map(fn (QuestionAttempt $q) => AttemptPresenter::answer($q))->values()->all();

        return [
            'review' => $review->toClient(),
            'lessonCode' => (string) $session->lesson->code,
            'lessonTitle' => (string) ($session->lesson->title ?? ''),
            'level' => (int) $session->level,
            'exerciseId' => (string) $exerciseAttempt->exercise_id,
            'questionId' => (string) $attempt->question_id,
            'questions' => $questions,
        ];
    }

    /** @throws DomainException */
    public function visibleTo(User $teacher, int $reviewId): AnswerReview
    {
        $review = AnswerReview::find($reviewId);
        if ($review === null || ! $this->responses->rosterOf($teacher)->has($review->student_id)) {
            throw new DomainException('Correction introuvable.');
        }

        return $review;
    }

    /** @param  Collection<int, array<int, array{id: int, name: string}>>  $roster */
    private function item(AnswerReview $review, ?User $student, Collection $roster): array
    {
        $attempt = $review->questionAttempt;
        $exerciseAttempt = $attempt->exerciseAttempt;
        $session = $exerciseAttempt->practiceSession;

        return [
            'review' => $review->toClient(),
            'student' => ClassroomAccess::identity($student, $review->student_id) + ['classrooms' => $roster[$review->student_id] ?? []],
            'lessonCode' => (string) $session->lesson->code,
            'lessonTitle' => (string) ($session->lesson->title ?? ''),
            'level' => (int) $session->level,
            'exerciseId' => (string) $exerciseAttempt->exercise_id,
        ] + AttemptPresenter::answer($attempt);
    }
}
