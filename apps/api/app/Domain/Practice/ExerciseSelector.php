<?php

namespace App\Domain\Practice;

use App\Domain\Access\ContentAccess;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Support\Freshness;
use App\Models\AssessmentItem;
use App\Models\ExerciseAttempt;
use App\Models\LearningEvidence;
use App\Models\PracticeSession;
use App\Models\StudentLearningPointProgress;

/**
 * Choisit le PROCHAIN exercice d'une séance (Mastery V2, phase 9).
 *
 * Séparé du moteur de maîtrise, dans les deux sens : il LIT l'état canonique
 * et le registre d'items, il n'écrit jamais la maîtrise ; et le moteur ne
 * l'appelle jamais. C'est ce qui permet à une banque de 15, 200 ou 500
 * exercices par niveau de n'être qu'une question de charge pour le
 * sélecteur, jamais une question d'architecture pour la maîtrise.
 *
 * Coût : borné par UN niveau d'UNE leçon — quatre requêtes indexées, quelle
 * que soit la taille de la banque (candidats du niveau, états des points de
 * la leçon, items déjà vus dans la leçon, misconceptions récentes).
 *
 * Classement, du plus important au moins important :
 *   1. le point PRINCIPAL le plus fragile pour cet élève
 *      (gap > reinforce > non évalué > maîtrisé périmé > maîtrisé frais) ;
 *   2. un exercice dont l'élève n'a encore vu aucune question ;
 *   3. un gabarit sur lequel il n'a encore rien réussi ;
 *   4. un exercice qui cible une misconception qu'il a montrée récemment ;
 *   5. un départage stable, graine = la séance (reproductible).
 */
class ExerciseSelector
{
    public const REASON_WEAK_POINT = 'weak_learning_point';

    public const REASON_UNSEEN = 'unseen';

    public const REASON_MISCONCEPTION = 'recent_misconception';

    public const REASON_ORDER = 'order';

    private const STATE_RANK = [
        MasteryState::STATUS_GAP => 0,
        MasteryState::STATUS_REINFORCE => 1,
        MasteryState::STATUS_UNASSESSED => 2,
        'mastered_stale' => 3,
        MasteryState::STATUS_MASTERED => 4,
    ];

    public function __construct(private ExerciseRepository $exercises) {}

    /**
     * @return array{exerciseId: ?string, reason: string, candidates: int}
     */
    public function next(PracticeSession $session): array
    {
        $lesson = $session->lesson;
        $level = (int) $session->level;

        // Les exercices du niveau, par le CONTENU (index), moins ceux que
        // l'administration a retirés, moins ceux déjà faits dans la séance.
        $done = ExerciseAttempt::where('practice_session_id', $session->id)
            ->where('status', 'completed')->pluck('exercise_id')->all();
        $hidden = ContentAccess::hiddenExerciseCodes($lesson->code);
        $pool = array_values(array_diff($this->exercises->indexFor($lesson->code)[$level] ?? [], $done, $hidden));

        if ($pool === []) {
            return ['exerciseId' => null, 'reason' => self::REASON_ORDER, 'candidates' => 0];
        }

        // Le registre : les questions de ces exercices, avec leurs points et gabarits.
        $items = AssessmentItem::query()
            ->active()
            ->where('lesson_id', $lesson->id)
            ->where('source_kind', AssessmentItem::SOURCE_PRACTICE)
            ->whereIn('exercise_code', $pool)
            ->get(['item_key', 'exercise_code', 'template_key', 'learning_points', 'answer_key'])
            ->groupBy('exercise_code');

        // Registre vide pour cette leçon : l'ordre du contenu, comme avant.
        if ($items->isEmpty()) {
            return ['exerciseId' => $this->firstAvailable($lesson->code, $pool, $session), 'reason' => self::REASON_ORDER, 'candidates' => count($pool)];
        }

        $userId = $session->user_id;

        $states = StudentLearningPointProgress::query()
            ->where('user_id', $userId)
            ->whereHas('learningPoint', fn ($q) => $q->where('lesson_id', $lesson->id))
            ->with('learningPoint:id,code')
            ->get()
            ->mapWithKeys(fn ($s) => [$s->learningPoint->code => $this->rankOf($s)]);

        $seen = LearningEvidence::query()
            ->where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->whereNotNull('item_key')
            ->selectRaw('item_key, template_key, MAX(is_correct) as succeeded')
            ->groupBy('item_key', 'template_key')
            ->get();
        $seenItems = $seen->pluck('item_key')->flip();
        $succeededTemplates = $seen->where('succeeded', 1)->pluck('template_key')->filter()->flip();

        $recentMisconceptions = LearningEvidence::query()
            ->where('user_id', $userId)
            ->where('lesson_id', $lesson->id)
            ->whereNotNull('misconception_id')
            ->orderByDesc('submitted_at')
            ->limit(10)
            ->pluck('misconception_id')
            ->flip();

        $ranked = [];
        foreach ($pool as $exerciseCode) {
            $questions = $items->get($exerciseCode);
            if ($questions === null) {
                // Exercice du contenu que le registre ne connaît pas encore :
                // candidat neutre, jamais privilégié.
                $ranked[] = [$exerciseCode, [self::STATE_RANK[MasteryState::STATUS_UNASSESSED], 1, 1, 1, $this->tieBreak($session, $exerciseCode)], self::REASON_ORDER];

                continue;
            }

            $weakest = PHP_INT_MAX;
            $unseen = true;
            $templateFresh = false;
            $targetsMisconception = false;
            foreach ($questions as $q) {
                foreach ($q->learning_points ?? [] as $lp) {
                    if (($lp['role'] ?? 'primary') === 'primary') {
                        $weakest = min($weakest, $states[$lp['code']] ?? self::STATE_RANK[MasteryState::STATUS_UNASSESSED]);
                    }
                }
                if ($seenItems->has($q->item_key)) {
                    $unseen = false;
                }
                if ($q->template_key === null || ! $succeededTemplates->has($q->template_key)) {
                    $templateFresh = true;
                }
                if (! $targetsMisconception && $recentMisconceptions->isNotEmpty()) {
                    $targetsMisconception = $this->targets($q->answer_key ?? [], $recentMisconceptions);
                }
            }

            $reason = match (true) {
                $weakest <= self::STATE_RANK[MasteryState::STATUS_REINFORCE] => self::REASON_WEAK_POINT,
                $targetsMisconception => self::REASON_MISCONCEPTION,
                $unseen => self::REASON_UNSEEN,
                default => self::REASON_ORDER,
            };

            // Clé de tri lexicographique : plus petit = choisi d'abord.
            $ranked[] = [$exerciseCode, [
                $weakest === PHP_INT_MAX ? self::STATE_RANK[MasteryState::STATUS_UNASSESSED] : $weakest,
                $unseen ? 0 : 1,
                $templateFresh ? 0 : 1,
                $targetsMisconception ? 0 : 1,
                $this->tieBreak($session, $exerciseCode),
            ], $reason];
        }

        usort($ranked, fn ($a, $b) => $a[1] <=> $b[1]);

        // Le premier accessible (droits, publication) — le contrôle d'accès
        // n'est fait que sur les premiers candidats, pas sur toute la banque.
        foreach ($ranked as [$exerciseCode, , $reason]) {
            if (ContentAccess::isExerciseAvailable($lesson->code, $exerciseCode, $session->user)) {
                return ['exerciseId' => $exerciseCode, 'reason' => $reason, 'candidates' => count($pool)];
            }
        }

        return ['exerciseId' => null, 'reason' => self::REASON_ORDER, 'candidates' => count($pool)];
    }

    private function rankOf(StudentLearningPointProgress $s): int
    {
        if ($s->status === MasteryState::STATUS_MASTERED) {
            return Freshness::of($s->last_evidence_at) === Freshness::STALE
                ? self::STATE_RANK['mastered_stale']
                : self::STATE_RANK[MasteryState::STATUS_MASTERED];
        }

        return self::STATE_RANK[$s->status] ?? self::STATE_RANK[MasteryState::STATUS_UNASSESSED];
    }

    /** L'item cible-t-il une misconception récente (choix ou signature) ? */
    private function targets(array $answerKey, $recent): bool
    {
        foreach ($answerKey['choices'] ?? [] as $choice) {
            if (! empty($choice['misconceptionId']) && $recent->has($choice['misconceptionId'])) {
                return true;
            }
        }
        foreach ($answerKey['misconceptionSignatures'] ?? [] as $sig) {
            if (! empty($sig['id']) && $recent->has($sig['id'])) {
                return true;
            }
        }

        return false;
    }

    /** Départage stable et reproductible : même séance, même ordre. */
    private function tieBreak(PracticeSession $session, string $exerciseCode): int
    {
        return crc32($session->session_id.'|'.$exerciseCode);
    }

    private function firstAvailable(string $lessonCode, array $pool, PracticeSession $session): ?string
    {
        foreach ($pool as $code) {
            if (ContentAccess::isExerciseAvailable($lessonCode, $code, $session->user)) {
                return $code;
            }
        }

        return null;
    }
}
