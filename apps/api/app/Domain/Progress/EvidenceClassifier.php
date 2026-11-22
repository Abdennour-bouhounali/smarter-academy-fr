<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Models\LearningEvidence;

/**
 * L'IDENTITÉ d'une preuve et sa NATURE par rapport au passé de l'élève.
 *
 *   item_key      = source:leçon:exercice:question   — LA question exacte
 *   template_key  = le gabarit déclaré par le contenu, sinon null
 *   attempt_number = 1 + preuves antérieures de l'élève sur cet item
 *   demonstration_kind :
 *     first                 rien sur cet item, rien sur ce gabarit
 *     variant               rien sur cet item, déjà une tentative sur le gabarit
 *     retry_after_failure   déjà tenté cet item, jamais réussi
 *     repeat_after_success  déjà réussi cet item
 *
 * Le cœur (`classifyFrom`) est PUR : il prend des faits. Deux adaptateurs
 * fournissent ces faits — la base (au moment de l'écriture) et le rejeu (une
 * marche ordonnée en mémoire) — pour que les deux chemins classent pareil.
 */
final class EvidenceClassifier
{
    public const SOURCE_FINAL_TEST = 'final_test';

    public const SOURCE_PRACTICE = 'practice';

    /** Le pseudo-code d'exercice du test final : il n'a pas d'exercice. */
    public const FINAL_TEST_EXERCISE = 'final';

    // ── Identité ─────────────────────────────────────────────────────────────

    public static function itemKey(string $sourceKind, string $lessonCode, ?string $exerciseCode, string $questionId): string
    {
        return "{$sourceKind}:{$lessonCode}:".($exerciseCode ?? self::FINAL_TEST_EXERCISE).":{$questionId}";
    }

    /** 'assessment' | 'practice_exercise' → 'final_test' | 'practice' */
    public static function sourceKindOf(string $assessmentType): string
    {
        return $assessmentType === EvidenceEvent::SOURCE_PRACTICE ? self::SOURCE_PRACTICE : self::SOURCE_FINAL_TEST;
    }

    /**
     * Lit l'identité d'une preuve à partir de son `question_code` historique :
     * `'E1'` pour le test final, `'ex-…:q2'` pour la pratique — et `'ex-…::q2'`
     * pour les preuves du jeu de démonstration (DemoStudentSimulator), qui
     * utilisait deux deux-points.
     *
     * @return array{sourceKind: string, exerciseCode: ?string, questionId: string, itemKey: string}
     */
    public static function identityFromQuestionCode(string $assessmentType, string $lessonCode, string $questionCode): array
    {
        $sourceKind = self::sourceKindOf($assessmentType);

        if ($sourceKind === self::SOURCE_PRACTICE && preg_match('/^(.+?):{1,2}([^:]+)$/', $questionCode, $m)) {
            $exerciseCode = $m[1];
            $questionId = $m[2];
        } else {
            // Test final (« E1 ») — ou une preuve de pratique dont le code ne
            // porte pas d'exercice : l'item est alors la question seule.
            $exerciseCode = null;
            $questionId = $questionCode;
        }

        return [
            'sourceKind' => $sourceKind,
            'exerciseCode' => $exerciseCode,
            'questionId' => $questionId,
            'itemKey' => self::itemKey($sourceKind, $lessonCode, $exerciseCode, $questionId),
        ];
    }

    // ── Nature (cœur pur) ─────────────────────────────────────────────────────

    /**
     * @param  PriorFacts  $facts  ce que l'élève a déjà fait sur l'item et le gabarit
     * @return array{attemptNumber: int, demonstrationKind: string}
     */
    public static function classifyFrom(PriorFacts $facts): array
    {
        if ($facts->nonInertOnItem === 0) {
            $kind = $facts->nonInertOnTemplate > 0 ? EvidenceEvent::KIND_VARIANT : EvidenceEvent::KIND_FIRST;
        } elseif ($facts->successOnItem) {
            $kind = EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS;
        } else {
            $kind = EvidenceEvent::KIND_RETRY_AFTER_FAILURE;
        }

        return ['attemptNumber' => $facts->rowsOnItem + 1, 'demonstrationKind' => $kind];
    }

    // ── Adaptateur base de données ────────────────────────────────────────────

    /**
     * Les faits, lus en base : deux requêtes indexées sur (user_id, item_key)
     * et (user_id, template_key). Aucun balayage.
     */
    public function factsFromDatabase(int $userId, string $itemKey, ?string $templateKey): PriorFacts
    {
        $inert = [Outcome::SyntaxError->value, Outcome::Abandoned->value];

        $item = LearningEvidence::query()
            ->where('user_id', $userId)
            ->where('item_key', $itemKey)
            ->selectRaw('COUNT(*) as rows_on_item')
            ->selectRaw('SUM(CASE WHEN outcome IS NULL OR outcome NOT IN (?, ?) THEN 1 ELSE 0 END) as non_inert', $inert)
            ->selectRaw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as successes')
            ->first();

        $template = null;
        if ($templateKey !== null) {
            $template = LearningEvidence::query()
                ->where('user_id', $userId)
                ->where('template_key', $templateKey)
                ->selectRaw('SUM(CASE WHEN outcome IS NULL OR outcome NOT IN (?, ?) THEN 1 ELSE 0 END) as non_inert', $inert)
                ->selectRaw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as successes')
                ->first();
        }

        $nonInertOnItem = (int) ($item->non_inert ?? 0);
        $successOnItem = (int) ($item->successes ?? 0) > 0;

        // Un item est toujours une instance de son gabarit : sans gabarit
        // déclaré, le gabarit EST l'item.
        return new PriorFacts(
            rowsOnItem: (int) ($item->rows_on_item ?? 0),
            nonInertOnItem: $nonInertOnItem,
            successOnItem: $successOnItem,
            nonInertOnTemplate: $template === null ? $nonInertOnItem : (int) ($template->non_inert ?? 0),
            successOnTemplate: $template === null ? $successOnItem : (int) ($template->successes ?? 0) > 0,
        );
    }
}
